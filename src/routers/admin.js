const express = require('express');
const Admin = require('../models/admin');
const auth = require('../middleware/auth');

const router = new express.Router();

// POST Create admin
router.post('/admin', async (req, res) => {
    const admin = new Admin(req.body);

    try {
        await admin.save();
        const token = await admin.generateAuthToken();
        res.status(201).send({admin, token});
    } catch (e) {
        res.status(400).send(e);
    }
});

// POST Login (login: admin, password: 123)
router.post('/login', async (req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.username, req.body.password);
        const token = await admin.generateAuthToken();
        res.setHeader('Authorization', 'Bearer '+ token); 
        res.send({status: 'ok'});
    } catch (e) {
        res.status(400).send({status: "error", message: {
            username: e.message,
            password: e.message
        }});
    }
});

// POST Admin logout
router.post('/logout', auth, async (req, res) => {
    try{
        req.admin.tokens = [];
        await req.admin.save();
        res.send();
    } catch(e) {
        res.status(500).send();
    }
});

module.exports = router;