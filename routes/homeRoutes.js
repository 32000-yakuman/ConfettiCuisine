"use strict"
const router = require("express").Router(),
    homeController = require("../controllers/homeController"),
    { verifyJWT } = require("../controllers/usersController")

router.get("/", homeController.index)
router.get("/chat", (req, res) => {
    res.render("chat", { currentUser: res.locals.currentUser })
})
router.get("/contact", homeController.contact)

module.exports = router