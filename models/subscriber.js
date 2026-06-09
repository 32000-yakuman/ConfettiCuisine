"use strict"
const mongoose = require("mongoose")

let subscriberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
        },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    membershipNumber: {
        type: Number,
        min: 0o001,
        max: 99999
    },
    // コースプロパティでコースモデルを参照する
    courses: [{type: mongoose.Schema.Types.ObjectId, ref: "Course"}]
})

subscriberSchema.methods.getInfo = function() {
    return `Name ${this.name} Email: ${this.email} MembershipNumber: ${this.membershipNumber}`
}

subscriberSchema.methods.findLocalSubscribers = function() {
    return this.model("Subscriber")
    .find({membershipNumber: this.membershipNumber})
    .exec()
}

module.exports = mongoose.model("Subscriber", subscriberSchema)