const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 5 * 60 * 1000,
    }
}));

app.use(express.json());
app.use("/auth", authRouter);
app.use(express.static(path.join(__dirname, 'views')));

const start = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        app.listen(PORT, () => console.log(`server started`))
    }
    catch (err) {
        console.log(err)
    }
}

start();