const mongoose = require('mongoose');
const { type } = require('os');

const submissionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    materialId: { type: String, required: true },
    studentId: { type: String, required: true },
    description: { type: String },
    file: { type: String },
    grade: { type: Number, default: 1 }, //if grade is 1, it means it hasn't been graded yet
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Submission', submissionSchema);