const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

// GET All tasks
// GET /?sortBy=sort_field(id | username | email | status):sort_direction(asc | desc)
// GET /?page=pageNumber(page number for pagination)
router.get('/', async (req, res) => {
    const sort = {};

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        const page = parseInt(req.query.page);
        
        if(page < 0 || page === 0) {
            throw new Error('Номер страницы для пагинации не может быть меньше или равно нулю.');
        }

        const total_task_count = await Task.countDocuments(); 
        const tasks = await Task.find({}).sort(sort).limit(3).skip((page-1)*3);
        res.send({
            status: 'ok',
            message: {
                tasks: tasks,
                total_task_count
            }
        });
    } catch (e) {
        res.status(500).send({
            status: 'error',
            message: e.message
        });
    }

});

// POST Create a new task
router.post('/create', async (req, res) => {

    const task = new Task({
        username: req.body.username,
        email: req.body.email,
        text: req.body.text
    });

    try {
        await task.save();
        res.status(201).send(
            {
                status: 'ok',
                message: task
            }
        );
    } catch (e) {
        res.status(500).send({
            status: 'error',
            message: {
                username: e.errors.username ? e.errors.username.message : '',
                email: e.errors.email ? e.errors.email.message : '',
                text: e.errors.text ? e.errors.text.message : '',
            }
        });
    }
});

// GET task by ID
router.get('/edit/:id', async (req, res) => {

    try {
        const task = await Task.findOne({ _id: req.params.id });
        
        if(!task){
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(400).send({
            status: 'error',
            message: {
                status: e.errors.status.message
            }
        });
    }
});

// PATCH Update task (only text and status modification is allowed)
router.patch('/edit/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['text', 'status', '__v'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({error: 'Неверные формат запроса'});
    }

    try {
        const task = await Task.findOne({ _id: req.params.id });
        
        if(!task){
            return res.status(404).send();
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send({
            status: 'ok'
        });
    } catch (e) {
        res.status(400).send({
            status: 'error',
            message: {
                status: e.errors.status.message
            }
        });
    }
});

module.exports = router;