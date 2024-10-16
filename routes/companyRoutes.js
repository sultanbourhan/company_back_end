const express = require("express");

const { uploadImages, resizeImg, resizeImglogo, resizeImage, create_company, get_company, get_company_my, update_company_my, update_company_id, get_company_id, delete_company_id, delete_company_my, create_company_advertisements_my, delete_company_advertisements_my, get_company_advertisements_my, create_company_comments, delete_company_comments_my, delete_company_comments_admin, create_company_Reviews} = require("../services/companyServicrs")

const {create_company_V, update_company_my_V, update_company_id_V, get_company_id_V, delete_company_id_V, create_company_advertisements_my_V, delete_company_advertisements_my_V, create_company_comments_V} = require("../validationResulterror/v_company")

const {check_login, check_user_role} = require("../services/authServicrs")


const companyroutes = express.Router()

companyroutes.route("/")
.post(check_login, check_user_role("admin"), uploadImages, resizeImg, resizeImglogo, create_company_V, create_company)
.get(get_company)

companyroutes.route("/get_company_my")
.get(check_login, get_company_my)

companyroutes.route("/update_company_my")
.put(check_login, update_company_my_V, update_company_my)

companyroutes.route("/update_company_id/:id")
.put(check_login, check_user_role("admin"), update_company_id_V, update_company_id)

companyroutes.route("/get_company_id/:id")
.get(check_login, get_company_id_V, get_company_id)

companyroutes.route("/delete_company_id/:id")
.delete(check_login, check_user_role("admin"), delete_company_id_V, delete_company_id)

companyroutes.route("/delete_company_my")
.delete(check_login, delete_company_my)

companyroutes.route("/create_company_advertisements_my")
.post(check_login, uploadImages, resizeImage, create_company_advertisements_my_V, create_company_advertisements_my)

companyroutes.route("/delete_company_advertisements_my/:id")
.delete(check_login, delete_company_advertisements_my_V, delete_company_advertisements_my)

companyroutes.route("/get_company_advertisements_my")
.get(check_login, get_company_advertisements_my)

companyroutes.route("/create_company_comments/:id")
.post(check_login, create_company_comments_V, create_company_comments)

companyroutes.route("/delete_company_comments_my/:companyId/:commentId")
.delete(check_login, delete_company_comments_my)

companyroutes.route("/delete_company_comments_admin/:companyId/:commentId")
.delete(check_login, delete_company_comments_admin)

companyroutes.route("/create_company_Reviews/:id")
.post(check_login, create_company_Reviews)




module.exports = companyroutes