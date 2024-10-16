const express = require("express");

const {create_user , get_users, get_user_ID , update_user, delete_user , update_password_user , imguser, resizeImg, create_addresses_user , delete_addresses_user, create_wichlist_user, delete_wichlist_user} = require("../services/userServicrs")

const {create_user_V, update_user_V, get_user_ID_V, delete_user_V, update_password_user_V, create_addresses_user_V , delete_addresses_user_V, create_wichlist_user_V, delete_wichlist_user_V} = require("../validationResulterror/v_user")

const {check_login, check_user_role} = require("../services/authServicrs")


const userroutes = express.Router()


userroutes.route("/")
.post(check_login, check_user_role("admin"), imguser, resizeImg ,create_user_V, create_user)
.get(check_login,get_users)

userroutes.route("/:id")
.get(check_login, check_user_role("admin") , get_user_ID_V ,get_user_ID)
.put(check_login , check_user_role("admin"), imguser, resizeImg  ,update_user_V ,update_user)
.delete(check_login , check_user_role("admin"),delete_user_V, delete_user)

userroutes.route("/:id/update_password")
.put(update_password_user_V , check_user_role("admin"), update_password_user)


module.exports = userroutes