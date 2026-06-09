"use strict"

const Subscriber = require("../models/subscriber")

module.exports = {
    index: async (req, res, next) => {
        try {
            const subscribers = await Subscriber.find({})
            res.locals.subscribers = subscribers
            next()
        }
        // エラーが発生した場合は、ホームページにリダイレクトする
        catch (error) {
            console.log("Error fetching subscribers:", `${error.message}`)
            next(error)
        } 
    },
    indexView: (req, res) => {
        res.render("subscribers/index")
    },

    saveSubscriber: async (req, res, next) => {
        try {
            // 新しいsubscriberを保存
            const newSubscriber = new Subscriber({
                name: req.body.name,
                email: req.body.email,
                membershipNumber: req.body.membershipNumber
            })
            const savedSubscriber = await newSubscriber.save()
            console.log("Successfully saved", savedSubscriber)
            res.render("thanks", { subscriber: savedSubscriber })
        } catch (error) {
            next(error)
        }
    },

    // ユーザ登録フォームを表示するアクション
    new: (req, res) => {
        res.render("subscribers/new")
    },
    // ユーザ登録フォームから送信されたデータを処理するアクション
    create: async (req, res, next) => {
        try {
            let subscriberParams = {
                name: req.body.name,
                email: req.body.email,
                membershipNumber: req.body.membershipNumber
            }
            const subscriber = await Subscriber.create(subscriberParams)
            req.flash("success", `${subscriber.name}'s account created successfully.`)
            res.locals.redirect = "/subscribers"
            res.locals.subscriber = subscriber
            next()
        } catch (error) {
            console.log(`Error creating subscriber: ${error.message}`)
            res.locals.redirect = "/subscribers/new"
            req.flash("error", `Failed to created subscriber account because: ${error.message}.`)
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
            const subscriber = await Subscriber.findById(req.params.id)

            if (!subscriber) {
                return next(new Error("Subscriber not found"))
            }

            res.locals.subscriber = subscriber
            next()
        } catch (error) {
            console.log("Error fetching subscriber by ID:", `${error.message}`)
            next(error)
        }
    },

    showView: (req, res) => {
        res.render("subscribers/show")
    },

    edit: async (req, res, next) => {
        try {
            const subscriber = await Subscriber.findById(req.params.id)
            if (!subscriber) {
                return next(new Error("Subscriber not found"))
            }
            res.render("subscribers/edit", { subscriber: subscriber })
        } catch (error) {
            console.log("Error fetching subscriber by ID:", `${error.message}`)
            next(error)
        }
    },

    update: async (req, res, next) => {
        try {
            const subscriberId = req.params.id,
                subscriber = await Subscriber.findById(subscriberId),
                subscriberParams = {
                    name: req.body.name,
                    email: req.body.email,
                    membershipNumber: req.body.membershipNumber
                }
            if (!subscriber) {
                return next(new Error("Subscriber not found"))
            }
            await Subscriber.findByIdAndUpdate(subscriberId, {
                $set: subscriberParams
            })
            res.locals.redirect = `/subscribers/${subscriberId}`
            res.locals.subscriber = subscriber
            next()
        } catch (error) {
            console.log("Error updating subscriber by ID:", `${error.message}`)
            next(error)
        }
    },
    delete: async (req, res, next) => {
        try {
            const subscriber = await Subscriber.findByIdAndDelete(req.params.id)
            if (!subscriber) {
                return next(new Error("Subscriber not found"))
            }
            res.locals.redirect = "/subscribers"
            next()
        } catch (error) {
            console.log("Error deleting subscriber by ID:", `${error.message}`)
            next(error)
        }
    }
}