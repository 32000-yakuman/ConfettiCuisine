"use strict"
const jsonWebToken = require("jsonwebtoken"),
      bcrypt = require("bcrypt"),
      User = require("../models/user"),
      { check, validationResult } = require("express-validator")

const getUserParams = body => ({
    name: {first: body.first, last: body.last},
    email: body.email,
    membershipNumber: body.membershipNumber,
    password: body.password
})
const handleError = (req, res, next, message, redirectPath) => {
    req.flash("error", message)
    res.locals.redirect = redirectPath
    next()
}

module.exports = {
    // ★ 戻るボタン対策（キャッシュ禁止）
    noCache: (req, res, next) => {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        next();
    },

    index: async (req, res, next) => {
        try {
            const users = await User.find({}).sort({ membershipNumber: 1 });
            res.locals.users = users
            next()
        }
        // エラーが発生した場合は、ホームページにリダイレクトする
        catch (error) {
            console.log("Error fetching users:", `${error.message}`)
            next(error)
        } 
    },
    indexView: (req, res) => {
        res.render("users/index")
    },

    // ユーザ登録フォームを表示するアクション
    new: (req, res) => {
        res.render("users/new")
    },
    // ユーザ登録フォームから送信されたデータを処理するアクション
    create: async (req, res, next) => {
        if(req.skip) return next()
    
        try {
            console.log("CREATE BODY:", req.body)
            console.log("CREATE PASSWORD RAW:", req.body.password)

            const userParams = getUserParams(req.body)
            // ★ bcrypt でパスワードをハッシュ
            const hashedPassword = await bcrypt.hash(userParams.password, 10)
            userParams.password = hashedPassword
            
            console.log("CREATE PASSWORD HASHED:", userParams.password)

            const user = await User.create(userParams)

            req.flash("success", `${user.fullName}'s account created successfully.`)
            res.locals.redirect = "/users"
            next()
        } catch (error) {
            handleError(req, res, next, 
                `Failed to create user: ${error.message}`, 
                "/users/new")
        }
    },
    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect
        if (redirectPath) res.redirect(redirectPath)
        else next()
    },

    show: async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id)

            if (!user) {
                return next(new Error("User not found"))
            }

            res.locals.user = user
            next()
        } catch (error) {
            console.log("Error fetching user by ID:", `${error.message}`)
            next(error)
        }
    },
    showView: (req, res) => {
        res.render("users/show")
    },
    edit: async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id)
            if (!user) {
                return next(new Error("User not found"))
            }

            // ★ 戻るボタン対策（キャッシュ禁止）
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");

            res.render("users/edit", { user: user })
        } catch (error) {
            console.log("Error fetching user by ID:", `${error.message}`)
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const userId = req.params.id
            const userParams = getUserParams(req.body)

            const user = await User.findByIdAndUpdate(userId, userParams, {
                new: true,
                runValidators: true
            })
            
            if (!user) {
                return handleError(req, res, next, "User not found", "/users")
            }

            res.locals.redirect = `/users/${userId}`
            res.locals.user = user
            next()
        
        } catch (error) {
            handleError(req, res, next,
                `Failed to update user: ${error.message}`,
                `/users/${req.params.id}/edit`)
        }
    },
    delete: async (req, res, next) => {
        try {
            const result = await User.deleteOne({ _id: req.params.id })
            console.log("DELETE RESULT:", result)
            
            if (result.deletedCount === 0) {
                console.log("NO USER DELETED")
                return handleError(req, res, next, "User not found","/users")
            }
            res.locals.redirect = "/users"
            next()
        } catch (error) {
            console.log("DELETE ERROR:", error)
            handleError(req, res, next,
            `Failed to delete user: ${error.message}`,
            "/users")
        }
    },
    login: (req, res) => {
        res.render("users/login")
    },
    validate: [
        check("membershipNumber")
        // sanitizeBody()は現バージョンでは不要
            .isLength({ min: 5, max: 5 })
            .withMessage("membershipNumber must be 5 digits"),
            
        (req, res, next) => {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                const messages = errors.array().map(e => e.msg)
                req.flash("error", messages.join(" and "))
                req.skip = true
                res.locals.redirect = "/users/new"
            }
            next()
        }
    ],
    apiAuthenticate: async (req, res) => {
        console.log("LOGIN BODY:", req.body)
        
        const user = await User.findOne({ membershipNumber: req.body.membershipNumber })
        console.log("FOUND USER:", user)
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }
        
        console.log("INPUT PASSWORD:", req.body.password)
        console.log("DB PASSWORD:", user.password)
        
        const isMatch = await bcrypt.compare(req.body.password, user.password)
        console.log("MATCH RESULT:", isMatch)
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            })
        }
        
        const token = jsonWebToken.sign(
            { data: user._id },
            "secret_encoding_passphrase",
            { expiresIn: "1h" }
        )
        
        res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000, // 1時間
        path: "/"
        })  

        return res.json({ success: true })
    },
    logout: (req, res, next) => {
    res.clearCookie("token"); 
    req.flash("success", "You have been logged out!");
    res.locals.redirect = "/";
    next();
    },
    /*
    verifyJWT: async (req, res, next) => {
        try {
            const token = req.headers.token || req.query.token

            console.log("verifyJWT called, token:", token);

            if (!token) {
                return res.status(401).json({
                error: true,
                message: "Provide Token"
                })
            }

            const payload = jsonWebToken.verify(
                token,
                "secret_encoding_passphrase"
            )

            const user = await User.findById(payload.data)
            
            if (!user) {
                // トークン認証に失敗したとき
                return res.status(401).json({
                    error: true,
                    message: "Cannot verify API token"
                })
            }

            res.locals.currentUser = user
            next()
        } catch {
            return res.status(401).json({
                    error: true,
                    message: "Invalid Token"
            })
        }
    },
    */
}