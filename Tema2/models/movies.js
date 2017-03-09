const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moviesSchema = new Schema({
    _id: {
        type: String,
        require: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },

}, {
    timestamps: true
});

const Movies = mongoose.model('Movie', moviesSchema);

module.exports = Movies;