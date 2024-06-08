const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config();
const PORT = process.env.PORT || 8000;
const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/api.routes'))

// Server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});