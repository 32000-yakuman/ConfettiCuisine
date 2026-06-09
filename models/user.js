"use strict"

const mongoose = require("mongoose"),
    { Schema } = mongoose,
    bcrypt     = require("bcrypt"), 
    Subscriber = require("./subscriber"),
    userSchema = new Schema({
        name: {
            first: {
                type: String,
                trim: true,
            },
            last: {
                type: String,
                trim: true,
            }
        },
        email: {
            type: String,
            lowercase: true
        },
        membershipNumber: {
            type: String,
            unique: true,
            min: 0o001,
            max: 99999
        },
        password: {
            type: String,
            required: true
        },
        // コースプロパティでコースモデルを参照する
        courses: [{
            type: Schema.Types.ObjectId,
            ref: "Course"
        }],
        subscribedAccount: {
            type: Schema.Types.ObjectId,
            ref: "Subscriber"
            }
    }, {// ドキュメントの作成日時と更新日時を自動的に保存するオプション
        timestamps: true
    })

// dbに保存されない仮想プロパティを定義
userSchema.virtual("fullName").get(function () {
    return `${this.name.first} ${this.name.last}`
})

// パスワード比較メソッド（login で使う）
userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password)
}


module.exports = mongoose.model("User", userSchema)