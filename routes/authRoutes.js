const express = require("express");

const {
  sign_up,
  login,
  get_user_my,
  check_login,
  update_user_my,
  logout,
  update_user_password_my,
  forgotPassword,
  verifyResetPassword,
  resetPassword,
  receiveAndSendEmailMe,
  verify_code,
} = require("../services/authServicrs");

const {
  sign_up_V,
  login_V,
  update_user_my_V,
  update_user_password_my_V,
  forgotpassord_V,
  receiveAndSendEmailMe_v,
} = require("../validationResulterror/v_auth");

const { imguser, resizeImg } = require("../services/userServicrs");

const authroutes = express.Router();

authroutes.route("/get_date_my").get(check_login, get_user_my);

authroutes.route("/logout").put(check_login, logout);

authroutes
  .route("/update_date_user_my")
  .put(check_login, imguser, resizeImg, update_user_my_V, update_user_my);

authroutes
  .route("/update_user_password_my")
  .put(check_login, update_user_password_my_V, update_user_password_my);

authroutes.route("/sign_up").post(sign_up_V, sign_up);
authroutes.route("/verify").post(verify_code);

authroutes.route("/login").post(login_V, login);

authroutes.route("/forgotpassord").post(forgotpassord_V, forgotPassword);

authroutes.route("/verifyResetPassword").post(verifyResetPassword);

authroutes.route("/resetPassword").post( resetPassword);
authroutes
  .route("/receiveAndSendEmailMe")
  .post(receiveAndSendEmailMe_v, receiveAndSendEmailMe);

module.exports = authroutes;
