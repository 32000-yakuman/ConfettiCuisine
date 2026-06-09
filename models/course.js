"use strict"

const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    items: [],
    maxStudents: {
        type: Number,
        default: 0,
        min: [0, "Course cannot have a negative number of students"]
    },
    fee: {
        type: Number,
        default: 0,
        min: [0, "Course cannot have a negative fee"]
    },
    membershipNumber: {
        type: Number,
        min: 0o001,
        max: 99999
    }
})

module.exports = mongoose.model("Course", courseSchema)