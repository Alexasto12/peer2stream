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
  },
  favourites: {
    content: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, unique: true },
        external_id: { type: String, required: true }
      }
    ]
  },
  notifications: {
    type: [
      {
        message: { type: String, maxlength: 255, required: true }
        // No se define ningún campo id personalizado, solo se usará _id
      }
    ],
    default: []
  }
}, {
  timestamps: true,
});

// Con esto provocamos que se quede vacia la array de content al crear un nuevo usuario
UserSchema.pre('save', function (next) {
  if (!this.favourites || !this.favourites.content) {
    this.favourites = { content: [] };
  }
  if (!this.notifications) {
    this.notifications = [];
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
