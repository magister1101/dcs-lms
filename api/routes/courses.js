const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const CoursesController = require('../controllers/course');

//routes

router.get('/', CoursesController.getCourse);

router.post('/create', checkAuth, CoursesController.createCourse);

router.post('/update/:courseId', CoursesController.updateCourse)


module.exports = router;