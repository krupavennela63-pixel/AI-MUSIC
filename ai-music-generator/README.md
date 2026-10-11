# Harmonix.AI - AI Music Generator

A modern, responsive web application for generating original instrumental music using AI and Deep Learning (LSTM) concepts. Built with Python, Flask, HTML, CSS, JavaScript, and music21.

## Features

- **Generate Original Music**: Select Genre, Mood, Primary Instrument, Duration, and Tempo.
- **Deep Learning Ready**: Includes an LSTM model architecture ready for training with MIDI datasets.
- **Demo Mode included**: A heuristic generator is built-in as a fallback so the app works beautifully out-of-the-box before the LSTM model is trained.
- **In-Browser Player & Piano Roll**: Visualizes and plays the generated MIDI files directly in your browser using `html-midi-player`.
- **Music Library**: Save, rename, replay, and delete your generated tracks.
- **Modern UI**: A premium, sleek glassmorphism dark theme with colorful gradients and responsive design.

## Prerequisites

- Python 3.8+
- Node.js / NPM (optional, for advanced web configurations)

## Setup Instructions

1. **Clone the repository or navigate to the project directory:**
   ```bash
   cd ai-music-generator
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install the required dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask application:**
   ```bash
   python app.py
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:5000`

## Project Structure

- `app.py`: The main Flask backend application.
- `ai_model.py`: Contains the LSTM model definition and the fallback `music21` heuristic generator.
- `models.py`: SQLAlchemy database models.
- `music.db`: SQLite database file (auto-generated on run).
- `templates/`: HTML templates (index.html).
- `static/`: Static assets.
  - `css/style.css`: The beautiful premium styling.
  - `js/app.js`: Frontend application logic.
  - `generated/`: Folder where generated MIDI tracks are saved.

## Notes on the AI Model

Training an LSTM to generate high-quality MIDI sequences takes significant time and a large dataset of MIDI files (e.g., MAESTRO dataset). 
The `ai_model.py` file includes the `build_model` architecture function for this. 
When no trained model weights (`lstm_music_model.h5`) are found, the app automatically gracefully falls back to the heuristic generator using `music21`, which algorithmically creates coherent MIDI sequences based on your selected Genre and Mood. This ensures the app is fully functional and interactive immediately!
