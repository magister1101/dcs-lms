const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // Reference to a Student collection
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true }, // Reference to a Quiz collection
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // Reference to a Course collection
    score: { type: Number, required: true }, // The score obtained
    total: { type: Number, required: true }, // Total possible score
    submittedAt: { type: Date, default: Date.now }, // Submission timestamp
    answers: [
        {
            question: { type: String, required: true },
            userAnswer: { type: String, required: true },
            correctAnswer: { type: String, required: true },
            correct: { type: Boolean, required: true },
        },
    ],
    canRedo: { type: Boolean, default: false }, // Determines if the student can retake the quiz
});

module.exports = mongoose.model('Grade', gradeSchema);
