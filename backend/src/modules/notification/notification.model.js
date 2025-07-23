// models/notification.model.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  link: String,
  type: {
    type: String,
    enum: ['leave', 'attendance', 'other'],
    default: 'other'
  },
  metadata: Object
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;