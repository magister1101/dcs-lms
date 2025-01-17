const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    instructorId: { type: String, required: true },
    instructorName: { type: String, required: true },
    instructorImage: { type: String, required: true },
    students: [{ type: String }],
    name: { type: String, required: true },
    section: { type: String, required: true },
    description: { type: String, required: true },
    file: { type: String, required: true },
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', courseSchema);