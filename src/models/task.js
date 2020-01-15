const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: [true, 'Поле является обязательным для заполнения'],
    },
    email: {
        type: String,
        required: [true, 'Поле является обязательным для заполнения'],
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Неверный email')
            }
        }
    },
    text: {
        type: String,
        trim: true,
        required: [true, 'Поле является обязательным для заполнения'],
    },
    status: {
        type: Number,
        default: 0,
    },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;