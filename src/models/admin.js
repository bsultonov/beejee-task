const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Поле является обязательным для заполнения'],
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Поле является обязательным для заполнения'],
        trim: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
});

// Generate auth token
adminSchema.methods.generateAuthToken = async function () {
    const admin = this;
    const token = jwt.sign({  _id: admin._id.toString() }, process.env.JWT_SECRET, {
        expiresIn: '1d'
   });

    admin.tokens = admin.tokens.concat({ token });
    await admin.save();

    return token;
}

// Find an admin by username and password  
adminSchema.statics.findByCredentials = async (username, password) => {
    const admin = await Admin.findOne({ username });

    if(username === '') {
        throw new Error('Поле является обязательным для заполнения');
    }

    if(!admin) {
        throw new Error('Неверный логин или пароль');
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if(!isMatch){
        throw new Error('Неверный логин или пароль');
    }

    return admin;
}

// Hash the plain text password before saving
adminSchema.pre('save', async function (next) {
    const admin = this;

    if(admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8);
    }

    next();
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;