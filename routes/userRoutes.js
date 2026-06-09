"use strict"
const router = require("express").Router(),
    usersController = require("../controllers/usersController"),
    noCache = usersController.noCache

router.get("/",  noCache, usersController.index, usersController.indexView)
// 新規ユーザー作成の経路
router.get("/new", usersController.new)
router.post("/create", usersController.validate, usersController.create, usersController.redirectView)

// ユーザー認証の経路
router.get("/login", usersController.login)
router.post("/logout", usersController.logout, usersController.redirectView)
// ユーザーCRUDの経路
router.get("/:id/edit", noCache, usersController.edit)
router.put("/:id/update", usersController.update, usersController.redirectView)
router.get("/:id", noCache, usersController.show, usersController.showView)
router.delete("/:id/delete", usersController.delete, usersController.redirectView)

module.exports = router