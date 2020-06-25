let express = require('express');
let router = express.Router();

let usersRouter = require('./routes/users');
router.use('/users', usersRouter);

module.exports = router;
