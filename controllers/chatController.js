"use strict"

const { connect } = require("mongoose"),
    Message       = require("../models/message")

module.exports = io => {
    io.on("connection", client => {
        console.log("new connection")
        
        // 履歴のロード
        client.on("load messages", async () => {
            try { 
                const messages = await Message.find({})
                    .sort({ createdAt: -1 })
                    .limit(10)

                client.emit("load all messages", messages.reverse())
            } catch(error) {
                console.log(`error`)
            }
        })

        client.on("disconnect", () => {
            client.broadcast.emit("user disconnected")
            console.log("user disconnected")
        })

        // メッセージ送信
        client.on("message", async (data) => {
            try{
                const messageAttributes = {
                    content: data.content,
                    userName: data.userName,
                    user: data.userId
                }
                const m = new Message(messageAttributes)
                await m.save()
                io.emit("message", messageAttributes)
            } catch (error) {
                console.log(`error: ${error.message}`)
            }
        })
    })
}