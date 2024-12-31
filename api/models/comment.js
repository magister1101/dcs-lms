const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    materialId: { type: String, required: true },
    usersId: { type: String, required: true },
    message: { type: String, required: true },
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', commentSchema);