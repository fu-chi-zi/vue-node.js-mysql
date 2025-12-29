const express = require('express');
const cors = require('cors');
const router = require('./user/index.js');
const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
app.use('/api',router);
app.listen(3006, () => {
    console.log('Server is running at http://127.0.0.1:3006');
});
