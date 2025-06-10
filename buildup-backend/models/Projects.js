// models/Project.js
import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  skills: String,
  ownerEmail: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Project', ProjectSchema);