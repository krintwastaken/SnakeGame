require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const cors = require('cors');
const PORT = process.env.PORT;

const app = express();

app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
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