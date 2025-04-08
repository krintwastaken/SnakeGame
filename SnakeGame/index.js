const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const cors = require('cors');
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));
app.use(express.json());
app.use("/auth", authRouter);

const start = async () => {
    try{
        await mongoose.connect(`mongodb+srv://krintwastaken:3208Nirv3208@snake-cluster.cu11q.mongodb.net/?retryWrites=true&w=majority&appName=snake-cluster`)
        app.listen(PORT, () => console.log(`server start on port ${PORT}`))
    }
    catch (err) {
        console.log(err)
    }
}

start();