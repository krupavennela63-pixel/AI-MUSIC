from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Track(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    mood = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    is_favorite = db.Column(db.Boolean, default=False)
    track_type = db.Column(db.String(20), default='ai')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'genre': self.genre,
            'mood': self.mood,
            'duration': self.duration,
            'filename': self.filename,
            'is_favorite': self.is_favorite,
            'track_type': self.track_type,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
