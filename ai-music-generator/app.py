import os
import time
from flask import Flask, render_template, request, jsonify, send_file
from models import db, Track
from ai_model import generate_music

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///music.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'generated')

db.init_app(app)

# Create the upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.json
    genre = data.get('genre', 'Classical')
    mood = data.get('mood', 'Calm')
    duration = int(data.get('duration', 15))
    tempo = int(data.get('tempo', 120))
    instrument = data.get('instrument', 'Piano')
    
    timestamp = int(time.time())
    filename = f"gen_{genre.lower()}_{mood.lower()}_{timestamp}.mid"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    try:
        # Generate the MIDI file
        generate_music(genre, mood, duration, filepath, tempo, instrument)
        
        # Save to database
        title = f"{mood} {genre} Track"
        new_track = Track(
            title=title,
            genre=genre,
            mood=mood,
            duration=duration,
            filename=filename
        )
        db.session.add(new_track)
        db.session.commit()
        
        return jsonify({"success": True, "track": new_track.to_dict()})
    except Exception as e:
        print(f"Error generating music: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/tracks', methods=['GET'])
def get_tracks():
    tracks = Track.query.order_by(Track.created_at.desc()).all()
    return jsonify([track.to_dict() for track in tracks])

@app.route('/api/tracks/<int:track_id>', methods=['DELETE'])
def delete_track(track_id):
    track = Track.query.get_or_404(track_id)
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], track.filename)
        if os.path.exists(filepath):
            os.remove(filepath)
        db.session.delete(track)
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/tracks/<int:track_id>', methods=['PUT'])
def rename_track(track_id):
    track = Track.query.get_or_404(track_id)
    data = request.json
    try:
        track.title = data.get('title', track.title)
        db.session.commit()
        return jsonify({"success": True, "track": track.to_dict()})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/tracks/<int:track_id>/favorite', methods=['PUT'])
def toggle_favorite(track_id):
    track = Track.query.get_or_404(track_id)
    try:
        track.is_favorite = not track.is_favorite
        db.session.commit()
        return jsonify({"success": True, "track": track.to_dict()})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/tracks/youtube', methods=['POST'])
def save_youtube_track():
    data = request.json
    video_id = data.get('video_id')
    title = data.get('title', 'YouTube Track')
    
    if not video_id:
        return jsonify({"success": False, "error": "No video ID provided"}), 400
        
    try:
        new_track = Track(
            title=title,
            genre='YouTube',
            mood='Streaming',
            duration=0,
            filename=video_id,
            track_type='youtube',
            is_favorite=True
        )
        db.session.add(new_track)
        db.session.commit()
        return jsonify({"success": True, "track": new_track.to_dict()})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/download/<filename>')
def download(filename):
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)
    return "File not found", 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
