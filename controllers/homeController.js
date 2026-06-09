"use strict"

module.exports = {
    contact: (req, res) => {
        res.render("contact")
    },
    index: (req, res) => {
        res.render("index")
    },
    logErrorPaths: (req,res) => {
        console.log(`request made to: ${req.url}`)
        next()
    },
    chat: (req, res) => {
        res.render("chat")
    }
}