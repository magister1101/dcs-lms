const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'fib'], required: true }, // Question type
    options: { type: [String] }, // For multiple-choice questions
    answer: { type: String, required: true }, // Correct answer
});

const quizSchema = new mongoose.Schema({
    courseId: { type: String, required: true },
    name: { type: String, required: true },
    questions: [questionSchema],
    isArchived: { type: Boolean, default: false },
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
