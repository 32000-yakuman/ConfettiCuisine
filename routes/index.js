const router = require("express").Router(),
    userRoutes = require("./userRoutes"),
    subscriberRoutes = require("./subscriberRoutes"),
    courseRoutes = require("./courseRoutes"),
    homeRoutes = require("./homeRoutes"),
    apiRoutes = require("./apiRoutes")

router.use("/api", apiRoutes)
router.use("/users", userRoutes)
router.use("/subscribers", subscriberRoutes)
router.use("/courses", courseRoutes)
router.use("/", homeRoutes)

module.exports = router