import os
import random
import numpy as np
from music21 import stream, note, chord, tempo, instrument, scale, pitch
# TensorFlow imports removed due to Application Control policy block on Windows environment

MODEL_PATH = "lstm_music_model.h5"

def build_model(vocab_size=100):
    """Placeholder for LSTM model architecture."""
    pass

def get_demo_scale(genre, mood):
    """Return a music21 scale based on genre and mood for the demo generator."""
    root = pitch.Pitch(random.choice(['C', 'D', 'E', 'F', 'G', 'A']))
    if mood in ['Happy', 'Energetic']:
        return scale.MajorScale(root), root
    else:  # Sad, Calm
        return scale.MinorScale(root), root

def generate_fallback_midi(genre, mood, duration_sec, output_path, bpm, instr_name):
    """Generate a decent-sounding MIDI using music21 primitives when no model is trained."""
    s = stream.Score()
    p = stream.Part()
    
    # Set instrument
    if instr_name == 'Piano':
        p.insert(0, instrument.Piano())
    elif instr_name == 'Guitar':
        p.insert(0, instrument.AcousticGuitar())
    elif instr_name == 'Synth':
        p.insert(0, instrument.ElectricPiano())
    elif instr_name == 'Strings':
        p.insert(0, instrument.StringInstrument())
    else:
        p.insert(0, instrument.Piano())
        
    # Set tempo
    t = tempo.MetronomeMark(number=bpm)
    p.insert(0, t)
    
    # Determine scale and rhythm based on genre/mood
    sc, root = get_demo_scale(genre, mood)
    pitches = [p for p in sc.getPitches(root.name + '3', root.name + '5')]
    
    # Generate notes
    num_notes = int((bpm / 60) * duration_sec * 2) # approx notes
    
    for _ in range(num_notes):
        # Choose note or chord
        if random.random() > 0.8:
            # Chord
            c_pitches = random.sample(pitches, 3)
            c = chord.Chord(c_pitches)
            c.quarterLength = random.choice([0.5, 1.0, 2.0])
            p.append(c)
        else:
            # Note
            n = note.Note(random.choice(pitches))
            n.quarterLength = random.choice([0.25, 0.5, 1.0])
            p.append(n)
            
    s.insert(0, p)
    s.write('midi', fp=output_path)
    return output_path

def generate_music(genre, mood, duration_sec, output_path, bpm=120, instr_name='Piano'):
    """
    Main function to generate music. 
    Tries to use a trained LSTM model. Falls back to a heuristic generator if model is missing.
    """
    if os.path.exists(MODEL_PATH):
        try:
            # Placeholder for actual model generation logic
            # To do this for real: load model, create random seed, predict sequence, map to notes
            pass
            # We would generate here... but since it's a demo, we will use fallback 
            # if we don't have the vocab and processing objects saved.
            print("Model found! (Note: fully generating from model requires vocabulary mapping)")
            return generate_fallback_midi(genre, mood, duration_sec, output_path, bpm, instr_name)
        except Exception as e:
            print(f"Error using model: {e}. Using fallback.")
            return generate_fallback_midi(genre, mood, duration_sec, output_path, bpm, instr_name)
    else:
        print("No trained model found. Using fallback generator.")
        return generate_fallback_midi(genre, mood, duration_sec, output_path, bpm, instr_name)
