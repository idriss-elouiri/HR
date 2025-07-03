// models/Shift.model.js
import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: String, // HH:mm format
    required: true
  },
  endTime: {
    type: String, // HH:mm format
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Shift = mongoose.model('Shift', shiftSchema);

export default Shift;