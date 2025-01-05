const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    courseId: { type: String, required: true },
    name: { type: String, required: true },
    questions: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true },
        },
    ],
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
});

module.exports = mongoose.model('Quiz', quizSchema);