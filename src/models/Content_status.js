import mongoose from 'mongoose';

const ContentStatusSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    externalId: { type: String, required: true }, // ID de la película o serie
    type: { type: String, enum: ['movie', 'show'], required: true },
    season: { type: Number, default: null }, // null si es película
    genre_ids: { type: [Number], default: [] }, //array de ids de los generos
    episode: { type: Number, default: null }, // null si es película
    status: { type: String, enum: ['pending', 'watched'], required: true },
    watchedTime: { type: Number, required: true }, // en segundos
    lastWatched: { type: Date, required: true }
});

export default mongoose.models.ContentStatus || mongoose.model('ContentStatus', ContentStatusSchema);
