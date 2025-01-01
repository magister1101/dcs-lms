const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    courseId: { type: String, required: true },
    message: { type: String, required: true },
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);    