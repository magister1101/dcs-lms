const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const CoursesController = require('../controllers/course');

//routes

router.get('/test', CoursesController.test);

router.get('/getComments', CoursesController.getComment)

router.get('/getMaterial', CoursesController.getMaterial)

router.get('/getSubmission', CoursesController.getSubmission)

router.get('/', CoursesController.getCourse);

router.post('/create', checkAuth, CoursesController.createCourse);

router.post('/test', CoursesController.test);

router.post('/material/update/:materialId', CoursesController.updateMaterial);

router.post('/update/:courseId', CoursesController.updateCourse);

router.post('/comment/:materialId', checkAuth, CoursesController.createComment);

router.post('/material/:courseId', CoursesController.createMaterial);

router.post('/submission/:materialId', checkAuth, CoursesController.createSubmission);

module.exports = router;