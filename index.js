const express = require('express');
const app=express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');


app.use(cors());
app.use(cookieParser());
// Logging middleware
app.use(logger('dev')); 
// JSON body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect(DATABASE);
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

server.listen(PORT, () => {
    console.log('Server Listening on port ' + PORT + '.');
  });