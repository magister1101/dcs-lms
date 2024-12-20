const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    instructor_id: { type: String, required: true },
    students: [{ type: String }],
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', courseSchema);