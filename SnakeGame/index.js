require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const cors = require('cors');
const PORT = process.env.PORT;

const app = express();

app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));
app.use(express.json());
app.use("/auth", authRouter);

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