"use strict"

const express             = require("express"),
    app                   = express(),
    router                = require("./routes/index"),
    layouts               = require("express-ejs-layouts"),
    mongoose              = require("mongoose"),
    methodOverride        = require("method-override"),
    expressSession        = require("express-session"),
    cookieParser          = require("cookie-parser"),
    connectFlash          = require("connect-flash"),
    expressValidator      = require("express-validator"),
    Subscriber            = require("./models/subscriber"),
    User                  = require("./models/user"),
    errorController       = require("./controllers/errorController")
    
mongoose.Promise = global.Promise

mongoose.connect(process.env.MONGODB_URI 
    || "mongodb://localhost:27017/recipe_db")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err))

const db = mongoose.connection;
db.on("error", err => console.log("MongoDB connected error!", err));

app.set("port", process.env.PORT || 3000)
app.set("view engine", "ejs")
app.set("token", process.env.TOKEN || "recipeT0k3n")

app.use(layouts)
app.use(express.static("public"))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(methodOverride("_method"))
app.use(cookieParser("secretCuisine123"))
app.use(expressSession({
    secret: "secretCuisine123",
    cookie: {
        maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
}))
app.use(connectFlash())

// フラッシュメッセージをレスポンスのローカル変数flashMessagesに代入
// フラッシュメッセージと初期値
app.use((req, res, next) => {
    res.locals.flashMessages = req.flash()
    res.locals.loggedIn = false
    res.locals.currentUser = null
    next()
})

// ★★★ JWT から currentUser を復元するミドルウェア（ここが最重要） ★★★
app.use(async (req, res, next) => {
    const token = req.cookies.token ||req.headers.token || req.query.token 

    if (!token) {
        return next()
    }

    try {
        const payload = require("jsonwebtoken").verify(
            token,
            "secret_encoding_passphrase"
        )

        const user = await User.findById(payload.data)

        if (user) {
            res.locals.loggedIn = true
            res.locals.currentUser = user
        }
    } catch (e) {
        // token が壊れていても無視して次へ
    }

    next()
})

// ★★★ ここより前に置かないと絶対に効かない ★★★
app.use("/", router)


app.use(errorController.logErrors);
app.use(errorController.respondNoResourceFound);
app.use(errorController.respondInternalError);

const server = app.listen(app.get("port"), () => {
    console.log(`Server running at http://localhost:${app.get("port")}`)
}),
    io = require("socket.io")(server),
    chatController = require("./controllers/chatController")(io)
