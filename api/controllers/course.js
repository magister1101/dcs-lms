const mongoose = require('mongoose');

const Course = require('../models/course');
const Comment = require('../models/comment');
const Material = require('../models/material');
const Submission = require('../models/submission');
const Test = require('../models/test');
const Notification = require('../models/notification');
const User = require('../models/user');

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
            return res.status(200).json(updatedMaterial);

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
        const { isArchived, query, filter } = req.query;

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

        const course = new Course({
            _id: courseId,
            instructorId: instructorId,
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

        const material = new Material({
            _id: new mongoose.Types.ObjectId(),
            coursesId: courseId,
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

        const submission = new Submission({
            _id: new mongoose.Types.ObjectId(),
            materialId: materialId,
            studentId: studentId,
            description: description,
            file: file,
        });

        const saveSubmission = await submission.save();
        return res.status(201).json({
            message: "Submission created successfully",
            submission: saveSubmission
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

exports.createQuiz = async (req, res) => {
    try {

        const coursesId = req.params.courseId;
        const { name, questions } = req.body;
        const quiz = new Quiz({ coursesId, name, questions });
        await quiz.save();
        res.status(201).json({ message: 'Quiz created successfully!' });

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

        performUpdateMaterial(materialId, updateFields, res);
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