import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date
    },
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift',
        required: true
    },
    workingHours: {
        type: Number,
        min: 0,
        max: 24
    },
    delay: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: ['حاضر', 'متأخر', 'غياب', 'إجازة'],
        default: 'حاضر'
    },
    deviceId: {
        type: String,
        required: true
    },
    syncStatus: {
        type: String,
        enum: ['synced', 'pending', 'error'],
        default: 'pending'
    },
    // إضافة حقل للملاحظات
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster queries
attendanceSchema.index({ employee: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;