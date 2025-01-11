const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const CoursesController = require('../controllers/course');

//routes

router.get('/test', CoursesController.test);

router.get('/getComment', CoursesController.getComment);

router.get('/getGrade', CoursesController.getGrade);

router.get('/getNotification', CoursesController.getNotification);

router.get('/getMaterial', CoursesController.getMaterial);

router.get('/grades/totalGrades/:studentId', CoursesController.grade);

router.get('/getQuizQuestions/:quizId', CoursesController.getQuizQuestions);

router.get('/getQuiz', CoursesController.getQuiz);

router.get('/getSubmission', CoursesController.getSubmission);

router.get('/joinCourse/:courseId', checkAuth, CoursesController.joinCourse);

router.get('/', CoursesController.getCourse);

router.post('/create', checkAuth, CoursesController.createCourse);

router.post('/test', CoursesController.test);

router.post('/material/update/:materialId', CoursesController.updateMaterial);

router.post('/answerQuiz/:quizId', checkAuth, CoursesController.answerQuiz);

router.post('/update/:courseId', checkAuth, CoursesController.updateCourse);

router.post('/comment/:materialId', checkAuth, CoursesController.createComment);

router.post('/material/:courseId', checkAuth, CoursesController.createMaterial);

router.post('/submission/:materialId', checkAuth, CoursesController.createSubmission);

router.post('/submission/grade/:studentId', checkAuth, CoursesController.gradeSubmission);

router.post('/quiz/:courseId', CoursesController.createQuiz);

module.exports = router;