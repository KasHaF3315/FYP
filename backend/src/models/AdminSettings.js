import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema({
  singleton: { type: String, unique: true, default: 'main' },
  encryptionLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  adaptiveContentNotes: { type: String, default: '' },
}, { timestamps: true });

export const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
