"use strict"
const httpStatus = require("http-status-codes")

exports.logErrors = (error, req, res, next) => {
    console.error(error.stack)
    next(error)
}

    // 404error
exports.respondNoResourceFound = (req, res) => {
        let errorCode = httpStatus.NOT_FOUND
        res.status(errorCode)
        res.render("error")
}
// 500error
exports.respondInternalError = (error, req, res, next) => {
        let errorCode = httpStatus.INTERNAL_SERVER_ERROR
        console.error(error.stack);
        res.status(errorCode)
        res.send(`${errorCode} | Sorry, our application is experiencing a problem`)
}
