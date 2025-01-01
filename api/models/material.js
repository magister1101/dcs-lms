const mongoose = require('mongoose');
const { type } = require('os');

const commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    coursesId: { type: String, required: true },
    name: { type: String },
    description: { type: String },
    file: { type: String },
    type: { type: String, required: true },
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Material', commentSchema);