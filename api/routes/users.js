const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const UsersController = require('../controllers/users');

//routes

router.get('/', UsersController.getUser);

router.get('/myUser', checkAuth, UsersController.myUser)

router.get('/tokenValidation', UsersController.tokenValidation)

router.post('/create', UsersController.createUser);

router.post('/login', UsersController.loginUser);

router.post('/update/:userId', checkAuth, UsersController.updateUser)


module.exports = router;