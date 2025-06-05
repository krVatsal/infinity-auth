const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { DATABASE, PORT } = require('./config/main');
const redisCache = require('./services/redisCache');
const authRoutes = require('./controllers/biz/authentication');

app.use(cors());
app.use(cookieParser());
// Logging middleware
app.use(morgan('dev')); 
// JSON body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize Redis
redisCache.initializeRedisClient();

mongoose.connect(DATABASE);
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Authentication routes
app.use('/api/auth', authRoutes);

const server = app.listen(PORT, () => {
    console.log('Server Listening on port ' + PORT + '.');
});