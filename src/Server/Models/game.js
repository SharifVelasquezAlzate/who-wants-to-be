const { Schema, model } = require('mongoose');

const GameSchema = new Schema({
    id: {type: String, required: true},
    questions: {type: Array, required: true},
    admin: {type: String, required: true},
    timePerQuestion: {type: String, required: true}
});


module.exports = model('games', GameSchema);