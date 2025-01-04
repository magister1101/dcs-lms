const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    coursesId: { type: String, required: true },
    name: { type: String, required: true },
    questions: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true },
        },
    ],
    createdAt: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
});

module.exports = mongoose.model('Quiz', quizSchema);