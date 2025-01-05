const mongoose = require('mongoose');

const Course = require('../models/course');
const Comment = require('../models/comment');
const Material = require('../models/material');
const Submission = require('../models/submission');
const Test = require('../models/test');
const Notification = require('../models/notification');
const User = require('../models/user');
const Quiz = require('../models/quiz');
const Grade = require('../models/grade');

const notify = async (instructorId, action, courseId, name, key, res) => {
    const instructor = await User.findOne({ _id: instructorId }).exec()
    const instructorName = instructor.firstName + " " + instructor.lastName;
    const instructorImage = instructor.file;

    const notification = new Notification({
        _id: new mongoose.Types.ObjectId(),
        courseId: courseId,
        instructorImage: instructorImage,
        message: instructorName + " " + action + " a " + key + ": " + name,
    });

    notification.save();
    return;
};

const performUpdate = (id, updateFields, res) => {
    Course.findByIdAndUpdate(id, updateFields, { new: true })
        .then((updatedCourse) => {
            if (!updatedCourse) {
                return res.status(404).json({ message: "Course not found" });
            }
            return updatedCourse;

        })
        .catch((err) => {
            return res.status(500).json({
                message: "Error in updating Course",
                error: err
            });
        })
};

const performUpdateMaterial = (id, updateFields, res) => {
    Material.findByIdAndUpdate(id, updateFields, { new: true })
        .then((updatedMaterial) => {
            if (!updatedMaterial) {
                return res.status(404).json({ message: "Material not found" });
            }
            return updatedMaterial;

        })
        .catch((err) => {
            return res.status(500).json({
                message: "Error in updating Material",
                error: err
            });
        })
};

exports.joinCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const studentId = req.userData.userId;

        const course = await Course.findOne({ _id: courseId }).exec();
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const student = await User.findOne({ _id: studentId }).exec();
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (student.courses.includes(courseId)) {
            return res.status(400).json({ message: "Student is already enrolled in this course" });
        }

        if (course.students.includes(studentId)) {
            return res.status(400).json({ message: "Student is already added to the course" });
        }

        student.courses.push(courseId);
        await student.save();

        course.students.push(studentId);
        await course.save();


        return res.status(200).json({
            message: "Student successfully joined the course",
            studentCourses: student.courses,
            courseStudents: course.students,
        });


    }
    catch (error) {
        console.error('Error joining course:', error);
        return res.status(500).json({
            message: "Error in joining course",
            error: error.message || error,
        });
    }
};

exports.getComment = async (req, res) => {
    try {
        const { isArchived, query, filter, courseId } = req.query;

        const escapeRegex = (value) => {
            return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        let searchCriteria = {};
        const queryConditions = [];

        if (query) {
            const escapedQuery = escapeRegex(query);
            const orConditions = [];

            if (mongoose.Types.ObjectId.isValid(query)) {
                orConditions.push({ _id: query });
            }
            orConditions.push(
                { name: { $regex: escapedQuery, $options: 'i' } },
                { coursesId: { $regex: escapedQuery, $options: 'i' } },
                { usersId: { $regex: escapedQuery, $options: 'i' } },
                { message: { $regex: escapedQuery, $options: 'i' } },
            );

            queryConditions.push({ $or: orConditions });
        }

        if (courseId) {
            const escapedcourseId = escapeRegex(courseId);
            queryConditions.push({
                $or: [
                    { coursesId: { $regex: escapedcourseId, $options: 'i' } },
                ],
            });
        }

        if (filter) {
            const escapedFilter = escapeRegex(filter);
            queryConditions.push({
                $or: [
                    { coursesId: { $regex: escapedFilter, $options: 'i' } },
                    { usersId: { $regex: escapedFilter, $options: 'i' } },
                ],
            });
        }

        if (isArchived) {
            const isArchivedBool = isArchived === 'true'; // Convert to boolean
            queryConditions.push({ isArchived: isArchivedBool });
        }

        if (queryConditions.length > 0) {
            searchCriteria = { $and: queryConditions };
        }
        const comments = await Comment.find(searchCriteria);
        return res.status(200).json(comments);

    } catch (error) {
        console.error('Error retrieving comments:', error);
        return res.status(500).json({
            message: "Error in retrieving comments",
            error: error.message || error,
        });
    }
};

exports.getNotification = async (req, res) => {
    try {
        const { isArchived, courseId, query } = req.query;

        const escapeRegex = (value) => {
            return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        let searchCriteria = {};
        const queryConditions = [];

        if (query) {
            const escapedQuery = escapeRegex(query);
            const orConditions = [];

            if (mongoose.Types.ObjectId.isValid(query)) {
                orConditions.push({ _id: query });
            }
            orConditions.push(
                { message: { $regex: escapedQuery, $options: 'i' } },
            );

            queryConditions.push({ $or: orConditions });
        }

        if (courseId) {
            const escapedFilter = escapeRegex(filter);
            queryConditions.push({
                $or: [
                    { courseId: { $regex: escapedFilter, $options: 'i' } },
                ],
            });
        }

        if (isArchived) {
            const isArchivedBool = isArchived === 'true'; // Convert to boolean
            queryConditions.push({ isArchived: isArchivedBool });
        }

        if (queryConditions.length > 0) {
            searchCriteria = { $and: queryConditions };
        }
        const notification = await Notification.find(searchCriteria);
        return res.status(200).json(notification);

    } catch (error) {
        console.error('Error retrieving notification:', error);
        return res.status(500).json({
            message: "Error in retrieving notification",
            error: error.message || error,
        });
    }
};

exports.getMaterial = async (req, res) => {
    try {
        const { isArchived, query, filter, courseId } = req.query;

        const escapeRegex = (value) => {
            return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        let searchCriteria = {};
        const queryConditions = [];

        if (query) {
            const escapedQuery = escapeRegex(query);
            const orConditions = [];

            if (mongoose.Types.ObjectId.isValid(query)) {
                orConditions.push({ _id: query });
            }
            orConditions.push(
                { coursesId: { $regex: escapedQuery, $options: 'i' } },
                { name: { $regex: escapedQuery, $options: 'i' } },
                { description: { $regex: escapedQuery, $options: 'i' } },
                { type: { $regex: escapedQuery, $options: 'i' } },
            );

            queryConditions.push({ $or: orConditions });
        }

        if (filter) {
            const escapedFilter = escapeRegex(filter);
            queryConditions.push({
                $or: [
                    { coursesId: { $regex: escapedFilter, $options: 'i' } },
                    { type: { $regex: escapedFilter, $options: 'i' } },
                ],
            });
        }
        if (courseId) {
            const escapedcourseId = escapeRegex(courseId);
            queryConditions.push({
                $or: [
                    { coursesId: { $regex: escapedcourseId, $options: 'i' } },
                ],
            });
        }

        if (isArchived) {
            const isArchivedBool = isArchived === 'true'; // Convert to boolean
            queryConditions.push({ isArchived: isArchivedBool });
        }

        if (queryConditions.length > 0) {
            searchCriteria = { $and: queryConditions };
        }
        const materials = await Material.find(searchCriteria);

        // Fetch comments for the materials
        const comments = await Comment.find({
            materialId: { $in: materials.map((m) => m._id.toString()) },
        });

        // Attach comments to their respective materials
        const materialsWithComments = materials.map((material) => {
            const materialComments = comments.filter(
                (comment) => comment.materialId === material._id.toString()
            );
            return { ...material._doc, comments: materialComments };
        });

        return res.status(200).json(materialsWithComments);

    } catch (error) {
        console.error('Error retrieving materials:', error);
        return res.status(500).json({
            message: "Error in retrieving materials",
            error: error.message || error,
        });
    }
};

exports.getQuiz = async (req, res) => {
    try {
        const { isArchived, query, courseId } = req.query;

        const escapeRegex = (value) => {
            return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        let searchCriteria = {};
        const queryConditions = [];

        if (query) {
            const escapedQuery = escapeRegex(query);
            const orConditions = [];

            if (mongoose.Types.ObjectId.isValid(query)) {
                orConditions.push({ _id: query });
            }
            orConditions.push(
                { name: { $regex: escapedQuery, $options: 'i' } },
            );

            queryConditions.push({ $or: orConditions });
        }
        if (courseId) {
            const escapedcourseId = escapeRegex(courseId);
            queryConditions.push({
                $or: [
                    { courseId: { $regex: escapedcourseId, $options: 'i' } },
                ],
            });
        }

        if (isArchived) {
            const isArchivedBool = isArchived === 'true'; // Convert to boolean
            queryConditions.push({ isArchived: isArchivedBool });
        }

        if (queryConditions.length > 0) {
            searchCriteria = { $and: queryConditions };
        }
        const quizzes = await Quiz.find(searchCriteria);

        return res.status(200).json(quizzes);

    } catch (error) {
        console.error('Error retrieving materials:', error);
        return res.status(500).json({
            message: "Error in retrieving materials",
            error: error.message || error,
        });
    }
};

exports.answerQuiz = async (req, res) => {
    try {
        const { answers } = req.body;
        const studentId = req.userData.userId;
        const quizId = req.params.quizId;

        if (!studentId) return res.status(400).json({ message: 'Student ID is required' });

        // Check if the student has already submitted this quiz
        const existingGrade = await Grade.findOne({ studentId, quizId });

        if (existingGrade) {
            return res.status(400).json({ message: 'You have already submitted this quiz.' });
        }

        // Fetch the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Evaluate answers
        const results = quiz.questions.map((q, index) => ({
            question: q.question,
            userAnswer: answers[index] || '',
            correctAnswer: q.answer,
            correct: q.answer === answers[index],
        }));

        const score = results.filter((r) => r.correct).length;

        // Save the grade
        const grade = new Grade({
            studentId,
            quizId,
            courseId: quiz.courseId,
            score,
            total: quiz.questions.length,
            answers: results,
        });

        await grade.save();

        res.json({ message: 'Quiz submitted successfully', results, score, total: quiz.questions.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGrade = async (req, res) => {
    try {
        const { query, isArchived, courseId, userId } = req.query;

        const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Student filter
        let studentFilter = {};
        if (userId) {
            studentFilter._id = userId;
        }
        if (query) {
            const escapedQuery = escapeRegex(query);
            studentFilter.$or = [
                { firstName: { $regex: escapedQuery, $options: 'i' } },
                { lastName: { $regex: escapedQuery, $options: 'i' } },
                { email: { $regex: escapedQuery, $options: 'i' } },
            ];
        }

        // Fetch the course to get the list of enrolled students
        const course = await Course.findOne({ _id: courseId }).select('students');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Fetch only the students enrolled in the course
        studentFilter._id = { $in: course.students };

        // Quiz filter
        let quizFilter = {};
        if (courseId) {
            quizFilter.courseId = { $regex: escapeRegex(courseId), $options: 'i' };
        }
        if (isArchived !== undefined) {
            quizFilter.isArchived = isArchived === 'true';
        }

        // Material filter for assignments
        let materialFilter = { type: 'assignment' }; // Filter materials with type 'assignment'
        if (courseId) {
            materialFilter.coursesId = { $regex: escapeRegex(courseId), $options: 'i' };
        }

        // Fetch students, quizzes, and assignments
        const students = await User.find(studentFilter);
        const quizzes = await Quiz.find(quizFilter);
        const materials = await Material.find(materialFilter);

        // Map through students and get their grades and assignments
        const studentGrades = await Promise.all(
            students.map(async (student) => {
                // Find grades for the student, filtered by courseId
                const grades = await Grade.find({
                    studentId: student._id,
                    quizId: { $in: quizzes.map((quiz) => quiz._id) }, // Only grades for specific quizzes
                }).populate('quizId');

                // Find submissions for assignments for the student
                const submissions = await Submission.find({
                    studentId: student._id,
                    materialId: { $in: materials.map((material) => material._id) }, // Only submissions for specific assignments
                }).populate('materialId');

                // Map quizzes with their grades, including courseId
                const gradesWithQuizStatus = quizzes.map((quiz) => {
                    const grade = grades.find((g) => g.quizId._id.toString() === quiz._id.toString());
                    return {
                        quizId: quiz._id,
                        courseId: quiz.courseId, // Add courseId here
                        quizName: quiz.name,
                        score: grade ? grade.score : 'Quiz not taken',
                        total: grade ? grade.total : null,
                        submittedAt: grade ? grade.submittedAt : null,
                    };
                });

                // Map materials (assignments) with their submissions
                const assignmentsWithSubmissionStatus = materials.map((material) => {
                    const submission = submissions.find(
                        (s) => s.materialId._id.toString() === material._id.toString()
                    );
                    return {
                        materialId: material._id,
                        courseId: material.coursesId, // Include courseId for assignments
                        materialName: material.name,
                        description: material.description,
                        file: material.file,
                        grade: submission ? submission.grade : 'Not graded',
                        submittedAt: submission ? submission.createdAt : 'Not submitted',
                    };
                });

                const studentName = `${student.firstName} ${student.lastName}`;

                return {
                    studentId: student._id,
                    name: studentName,
                    username: student.username,
                    email: student.email,
                    grades: gradesWithQuizStatus,
                    assignments: assignmentsWithSubmissionStatus, // Include assignments in the response
                };
            })
        );

        res.status(200).json(studentGrades);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getQuizQuestions = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        return res.json(quiz);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.getSubmission = async (req, res) => {
    try {
        const { isArchived, query, studentId, materialId } = req.query;

        const escapeRegex = (value) => {
            return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        let searchCriteria = {};
        const queryConditions = [];

        if (query) {
            const escapedQuery = escapeRegex(query);
            const orConditions = [];

            if (mongoose.Types.ObjectId.isValid(query)) {
                orConditions.push({ _id: query });
            }
            orConditions.push(
                { description: { $regex: escapedQuery, $options: 'i' } },
                { grade: { $regex: escapedQuery, $options: 'i' } },
            );

            queryConditions.push({ $or: orConditions });
        }

        if (studentId) {
            const escapedStudentId = escapeRegex(studentId);
            queryConditions.push({
                $or: [
                    { studentId: { $regex: escapedStudentId, $options: 'i' } },
                ],
            });
        }
        if (materialId) {
            const escapedMaterialId = escapeRegex(materialId);
            queryConditions.push({
                $or: [
                    { materialId: { $regex: escapedMaterialId, $options: 'i' } },
                ],
            });
        }

        if (isArchived) {
            const isArchivedBool = isArchived === 'true'; // Convert to boolean
            queryConditions.push({ isArchived: isArchivedBool });
        }

        if (queryConditions.length > 0) {
            searchCriteria = { $and: queryConditions };
        }
        const submission = await Submission.find(searchCriteria);
        return res.status(200).json(submission);

    } catch (error) {
        console.error('Error retrieving materials:', error);
        return res.status(500).json({
            message: "Error in retrieving materials",
            error: error.message || error,
        });
    }
};

exports.getCourse = async (req, res) => {
    try {
        const { isArchived, query, filter, studentId, instructorId } = req.query;

        const escapeRegex = (value) => {
            return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        let searchCriteria = {};
        const queryConditions = [];

        if (query) {
            const escapedQuery = escapeRegex(query);
            const orConditions = [];

            if (mongoose.Types.ObjectId.isValid(query)) {
                orConditions.push({ _id: query });
            }
            orConditions.push(
                { name: { $regex: escapedQuery, $options: 'i' } },
                { section: { $regex: escapedQuery, $options: 'i' } },
                { description: { $regex: escapedQuery, $options: 'i' } },
                { instructorId: { $regex: escapedQuery, $options: 'i' } },
                { students: { $regex: escapedQuery, $options: 'i' } },

            );

            queryConditions.push({ $or: orConditions });
        }

        if (filter) {
            const escapedFilter = escapeRegex(filter);
            queryConditions.push({
                $or: [
                    { instructorId: { $regex: escapedFilter, $options: 'i' } },
                    { section: { $regex: escapedFilter, $options: 'i' } },
                ],
            });
        }


        if (studentId) {
            const escapedStudentId = escapeRegex(studentId);
            queryConditions.push({
                $or: [
                    { students: { $regex: escapedStudentId, $options: 'i' } },
                ],
            });
        }

        if (instructorId) {
            const escapedInstructorId = escapeRegex(instructorId);
            queryConditions.push({
                $or: [
                    { instructorId: { $regex: escapedInstructorId, $options: 'i' } },
                ],
            });
        }

        if (isArchived) {
            const isArchivedBool = isArchived === 'true'; // Convert to boolean
            queryConditions.push({ isArchived: isArchivedBool });
        }

        if (queryConditions.length > 0) {
            searchCriteria = { $and: queryConditions };
        }
        const courses = await Course.find(searchCriteria);

        return res.status(200).json(courses);

    } catch (error) {
        console.error('Error retrieving courses:', error);
        return res.status(500).json({
            message: "Error in retrieving courses",
            error: error.message || error,
        });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId();
        const instructorId = req.userData.userId;
        const instructor = await User.findOne({ _id: instructorId }).exec()
        const instructorName = instructor.firstName + " " + instructor.lastName;
        const instructorImage = instructor.file;

        const course = new Course({
            _id: courseId,
            instructorId: instructorId,
            instructorName: instructorName,
            instructorImage: instructorImage,
            students: req.body.students,
            name: req.body.name,
            section: req.body.section,
            description: req.body.description,
            file: req.body.file,
            isArchived: false,
        })

        const saveCourse = await course.save();
        notify(instructorId, "Created", courseId, req.body.name, "course", res)
        return res.status(201).json({
            message: "Course created successfully",
            course: saveCourse
        });

    }
    catch (error) {
        console.error('Error creating course:', error);
        return res.status(500).json({
            message: "Error in creating course",
            error: error.message || error,
        });
    }
};

exports.createMaterial = async (req, res) => {
    try {
        const courseId = req.params.courseId
        const instructorId = req.userData.userId;

        const instructor = await User.findOne({ _id: instructorId }).exec()
        const instructorName = instructor.firstName + " " + instructor.lastName;
        const instructorImage = instructor.file;
        const material = new Material({
            _id: new mongoose.Types.ObjectId(),
            coursesId: courseId,
            instructorName: instructorName,
            instructorImage: instructorImage,
            name: req.body.name,
            description: req.body.description,
            file: req.body.file,
            type: req.body.type,
            dueDate: req.body.dueDate,
            grade: req.body.grade,
            isArchived: false,
        })

        const saveMaterial = await material.save();
        notify(instructorId, "Created", courseId, req.body.name, "material", res)
        return res.status(201).json({
            message: "Material created successfully",
            material: saveMaterial
        });

    }
    catch (error) {
        console.error('Error creating material:', error);
        return res.status(500).json({
            message: "Error in creating material",
            error: error.message || error,
        });
    }
};

exports.createComment = async (req, res) => {
    try {
        const commentId = new mongoose.Types.ObjectId();
        const materialId = req.params.materialId;
        const usersId = req.userData.userId;
        const message = req.body.message;

        const user = await User.findOne({ _id: usersId }).exec()
        const userName = user.firstName + " " + user.lastName;
        const userImage = user.file;

        const comment = new Comment({
            _id: commentId,
            materialId: materialId,
            user: userName,
            image: userImage,
            message: message,
        })

        const saveComment = await comment.save();

        return res.status(201).json({
            message: "Comment created successfully",
            comment: saveComment
        });

    }
    catch (error) {
        console.error('Error commenting:', error);
        return res.status(500).json({
            message: "Error in commenting",
            error: error.message || error,
        });
    }
};

exports.createSubmission = async (req, res) => {
    try {
        const materialId = req.params.materialId;
        const studentId = req.userData.userId;
        const { description, file } = req.body;

        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        const material = await Material.findById(materialId);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        const existingSubmission = await Submission.findOne({ materialId, studentId });
        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted this material.' });
        }

        const submission = new Submission({
            _id: new mongoose.Types.ObjectId(),
            materialId,
            studentId,
            description,
            file,
        });

        await submission.save();

        res.status(201).json({
            message: 'Material submitted successfully',
            submission: submission,
        });

    }
    catch (error) {
        console.error('Error in creating submission:', error);
        return res.status(500).json({
            message: "Error in creating submission",
            error: error.message || error,
        });
    }
};

exports.gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade } = req.body

        // Find the submission
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Check if the submission has already been graded
        if (submission.grade !== 0) {
            return res.status(400).json({ message: 'This submission has already been graded.' });
        }

        // Find the material associated with the submission
        const material = await Material.findById(submission.materialId);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        submission.grade = grade;
        await submission.save();

        // Respond with the updated submission
        res.status(200).json({
            message: 'Submission graded successfully',
            submission: submission,
        });

    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({
            message: 'Error grading submission',
            error: error.message || error,
        });
    }
};

exports.createQuiz = async (req, res) => {
    try {

        const coursesId = req.params.courseId;
        const { name, questions } = req.body;
        const _id = new mongoose.Types.ObjectId();
        const quiz = new Quiz({ _id, coursesId, name, questions });
        await quiz.save();
        res.status(201).json({
            message: 'Quiz created successfully!',
            quiz: quiz
        });

    } catch (err) {
        console.error('Error in creating quiz:', err);
        return res.status(500).json({
            message: "Error in creating quiz",
            error: err.message || err,
        });
    }
};

exports.updateCourse = async (req, res) => {
    try {

        const instructorId = req.userData.userId;
        const courseId = req.params.courseId;
        const course = Course.findOne({ _id: courseId }).exec();
        const updateFields = req.body;

        const updatedCourse = performUpdate(courseId, updateFields, res);
        notify(instructorId, "Updated", courseId, course.name, "course", res)

        return res.status(200).json(updatedCourse);
    }
    catch (error) {
        console.error('Error updating course:', error);
        return res.status(500).json({
            message: "Error in updating course",
            error: error.message || error,
        });
    }
};

exports.updateMaterial = async (req, res) => {
    try {
        const materialId = req.params.materialId;
        const updateFields = req.body;

        const updatedMaterial = performUpdateMaterial(materialId, updateFields, res);
        return res.status(200).json(updatedMaterial);
    }
    catch (error) {
        console.error('Error updating material:', error);
        return res.status(500).json({
            message: "Error in updating material",
            error: error.message || error,
        });
    }
};

exports.test = async (req, res) => {

    try {
        const id = "67759648383c678f88df5104";
        const courseId = "6774fa9eecd830dac321e789";
        const action = "added";

        notify(id, action, courseId, res)


    } catch (error) {
        console.error('Error in test:', error);
        return res.status(500).json({
            message: "Error in test",
            error: error.message || error,
        });
    }
};