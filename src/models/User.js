import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'standard'], default: 'standard' },
  settings: {
    prefered_lang: { type: String, enum:['es','ca','en','it','de','fr','jp'],default: 'es' },
    prefered_quality: { type: String, enum: ['720p', '1080p', '4k', 'other'], default: '1080p' },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
