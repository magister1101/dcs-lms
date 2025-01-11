const mongoose = require('mongoose');

const totalGradeSchema = new mongoose.Schema({
    studentId: String,
    grade: { type: Number, required: true }, // Decimal grade
    type: { type: String, enum: ['quiz', 'task'] }, // Grade type
    taskId: { type: String, required: true },
});

module.exports = mongoose.model('TotalGrade', totalGradeSchema);