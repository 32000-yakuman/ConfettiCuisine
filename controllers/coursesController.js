"use strict"

const Course   = require("../models/course"),
    httpStatus = require("http-status-codes"),
    User       = require("../models/user")

console.log("=== coursesController.index called ===")

module.exports = {
    index: async (req, res, next) => {
        try {
            const courses = await Course.find({})
            res.locals.courses = courses
            next()
        }
        // エラーが発生した場合は、ホームページにリダイレクトする
        catch (error) {
            console.log("Error fetching courses:", `${error.message}`)
            next(error)
        } 
    },
    indexView: (req, res) => {
        if (req.query.format === "json"){
            return res.status(200).json({
                status: 200,
                data: {
                    courses: res.locals.courses
                }
            })
        }
        res.render("courses/index")
    },
    // ユーザ登録フォームを表示するアクション
    new: (req, res) => {
        res.render("courses/new")
    },
    // ユーザ登録フォームから送信されたデータを処理するアクション
    create: async (req, res, next) => {
        try {
            let courseParams = {
                title: req.body.title,
                description: req.body.description,
                items: [req.body.items.split(",")],
                fee: req.body.fee,
                membershipNumber: req.body.membershipNumber
            }
            const course = await Course.create(courseParams)
            req.flash("success", `Your account entered ${course.title} successfully.`)
            res.locals.redirect = "/courses"
            res.locals.course = course
            next()
        } catch (error) {
            console.log(`Error joining the course:, ${error.message}`)
            res.locals.redirect = "/courses/new"
            req.flash("error", `Failed to enter the course because: ${error.message}.`)
            next(error)
        }
    },
    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect
        if (redirectPath) res.redirect(redirectPath)
        else next()
    },

    show: async (req, res, next) => {
        try {
            const course = await Course.findById(req.params.id)
            if (!course) {
                return next(new Error("Course not found"))
            }
            res.locals.course = course
            next()
        } catch (error) {
            console.log("Error fetching course by ID:", `${error.message}`)
            next(error)
        }
    },

    showView: (req, res) => {
        res.render("courses/show")
    },

    edit: async (req, res, next) => {
        try {
            const course = await Course.findById(req.params.id)
            if (!course) {
                return next(new Error("Course not found"))
            }
            res.render("courses/edit", { course: course })
        } catch (error) {
            console.log("Error fetching course by ID:", `${error.message}`)
            next(error)
        }
    },

    update: async (req, res, next) => {
        try {
            const courseId = req.params.id
            const course = await Course.findById(courseId),
                courseParams = {
                    title: req.body.title,
                    description: req.body.description,
                    items: req.body.items.split(","),
                    fee: req.body.fee,
                    membershipNumber: req.body.membershipNumber
                }

            if (!course) {
                return next(new Error("Course not found"))
            }
            await Course.findByIdAndUpdate(courseId, {
                $set: courseParams
            })
            res.locals.redirect = `/courses/${courseId}`    
            res.locals.course = course
            next()
        } catch (error) {
            console.log("Error updating course by ID:", `${error.message}`)
            next(error)
        }
    },

    delete: async (req, res, next) => {
        try {
            const course = await Course.findByIdAndDelete(req.params.id)
            if (!course) {
                return next(new Error("Course not found"))
            }
            res.locals.redirect = "/courses"
            next()
        } catch (error) {
            console.log("Error deleting course by ID:", `${error.message}`)
            next(error)
        }
    },
    respondJSON: (req, res) => {
        res.status(httpStatus.OK).json({
            status: httpStatus.OK,
            data: {
                courses: res.locals.courses,
                success: res.locals.success,
                message: res.locals.message
            }
        })
    },
    join: async (req, res, next) => {
        try{
            const currentUser = res.locals.currentUser
            if (!currentUser) {
                res.locals.success = false
                res.locals.message = "You must be logged in to join a course.";
                return next();
            }

            const courseId = req.params.id

            await User.findByIdAndUpdate(currentUser._id, {
                $addToSet: {
                    courses: courseId
                }
            })
            res.locals.success = true
            next()
        } catch (error) {
            next(error)
        }
    },
    filterUserCourses: async (req, res, next) => {
        try{
            const currentUser = res.locals.currentUser
            if (!currentUser) {
                    return next();
                }
            
            const joinedCourseIds = currentUser.courses.map(id => id.toString());

            res.locals.courses = res.locals.courses.map(course => {
                const joined = joinedCourseIds.includes(course._id.toString())
                return {
                    ...course.toObject(),
                    joined
                }
            })
            next()
        } catch (error) {
            next(error)
        }
    }
}