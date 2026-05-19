const express = require('express')
const app = express()
const morgan = require('morgan');
const cors = require('cors');
const AuthRouter = require('./routes/AuthRoutes');
const cookieParser = require('cookie-parser');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/auth', AuthRouter);

module.exports = app