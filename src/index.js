const express = require('express');
require('./db/mongoose');
const tasksRouter = require('./routers/task');
const adminRouter = require('./routers/admin');

const app = express();
const port = process.env.PORT;


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE, HEAD");
    res.header("Access-Control-Expose-Headers", "Authorization");
    next();
});
app.use(express.json());
app.use(tasksRouter);
app.use(adminRouter);

app.listen(port, () => {
    console.log("Server runs on port: " + port);
});