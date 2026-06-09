"use strict"
const router = require("express").Router(),
    coursesController = require("../controllers/coursesController"),
    usersController = require("../controllers/usersController")

router.post("/login", usersController.apiAuthenticate)
router.get("/courses/:id/join", 
    coursesController.join,
    coursesController.respondJSON)
router.get("/courses", 
    coursesController.index, 
    coursesController.filterUserCourses,
    coursesController.respondJSON)
// coursesController.errorJSONはrespondJSONに一本化
module.exports = router