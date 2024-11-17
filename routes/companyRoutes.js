const express = require("express");

const { uploadImages, resizeImg, resizeImglogo, resizeImage,resizeCategoreyimage, create_company, get_company, get_company_my, update_company_my, update_company_id, get_company_id, delete_company_id, delete_company_my, create_company_advertisements_my, delete_company_advertisements_my, get_company_advertisements_my, create_company_comments, delete_company_comments_my, delete_company_comments_admin, create_company_Reviews, create_Categorey, get_Categorey, delete_Categorey, get_Categorey_company, create_Company_requests, get_Company_requests, get_Company_requests_id, delete_Company_requests, get_Company_requests_my, Accept_Company_requests_admin, delete_Company_requests_admin, get_all_company_advertisements, likes_company_advertisements, update_Company_requests , update_Categorey ,get_Categorey_id, get_all_company_advertisements_id ,delete_company_advertisements_admin} = require("../services/companyServicrs")

const {create_company_V, update_company_my_V, update_company_id_V, get_company_id_V, delete_company_id_V, create_company_advertisements_my_V, delete_company_advertisements_my_V, create_company_comments_V, create_Categorey_V, delete_Categorey_V, get_Categorey_company_V, create_Company_requests_V, get_Company_requests_id_V, delete_Company_requests_V, Accept_Company_requests_admin_V, delete_Company_requests_admin_V, update_Company_requests_V ,update_Categorey_V} = require("../validationResulterror/v_company")

const {check_login, check_user_role} = require("../services/authServicrs")


const companyroutes = express.Router()

companyroutes.route("/")
.post(check_login, check_user_role("admin"), uploadImages, resizeImg, resizeImglogo,create_company_V, create_company)
.get(get_company)

companyroutes.route("/get_company_my")
.get(check_login, get_company_my)

companyroutes.route("/update_company_my")
.put(check_login,uploadImages, resizeImg, resizeImglogo, update_company_my_V, update_company_my)

companyroutes.route("/update_company_id/:id")
.put(check_login, check_user_role("admin"),uploadImages, resizeImg, resizeImglogo, update_company_id_V, update_company_id)

companyroutes.route("/get_company_id/:id")
.get(get_company_id_V, get_company_id)

companyroutes.route("/delete_company_id/:id")
.delete(check_login, check_user_role("admin"), delete_company_id_V, delete_company_id)

companyroutes.route("/delete_company_my")
.delete(check_login, delete_company_my)

companyroutes.route("/create_company_advertisements_my")
.post(check_login, uploadImages, resizeImage, create_company_advertisements_my_V, create_company_advertisements_my)

companyroutes.route("/delete_company_advertisements_my/:id")
.delete(check_login, delete_company_advertisements_my_V, delete_company_advertisements_my)

companyroutes.route("/delete_company_advertisements_admin/:id")
.delete(check_login,check_user_role("admin"), delete_company_advertisements_admin)

companyroutes.route("/get_company_advertisements_my/:id")
.get(check_login, get_company_advertisements_my)

companyroutes.route("/get_all_company_advertisements")
.get(get_all_company_advertisements)

companyroutes.route("/get_all_company_advertisements_id/:id")
.get(get_all_company_advertisements_id)

companyroutes.route("/likes_company_advertisements/:id")
.post(check_login, likes_company_advertisements)




companyroutes.route("/create_company_comments/:id")
.post(check_login, create_company_comments_V, create_company_comments)

companyroutes.route("/delete_company_comments_my/:companyId/:commentId")
.delete(check_login, delete_company_comments_my)

companyroutes.route("/delete_company_comments_admin/:companyId/:commentId")
.delete(check_login, delete_company_comments_admin)

companyroutes.route("/create_company_Reviews/:id")
.post(check_login, create_company_Reviews)

companyroutes.route("/create_Categorey")
.post(check_login, check_user_role("admin"), uploadImages, resizeCategoreyimage, create_Categorey_V, create_Categorey)

companyroutes.route("/update_Categorey/:id")
.put(check_login, check_user_role("admin"), uploadImages, resizeCategoreyimage, update_Categorey_V, update_Categorey)

companyroutes.route("/get_Categorey")
.get(get_Categorey)

companyroutes.route("/get_Categorey_id/:id")
.get(get_Categorey_id)

companyroutes.route("/delete_Categorey/:id")
.delete(check_login, check_user_role("admin"), delete_Categorey_V, delete_Categorey )

companyroutes.route("/get_Categorey_company/:id")
.get( get_Categorey_company_V, get_Categorey_company )

companyroutes.route("/create_Company_requests")
.post(check_login, uploadImages, resizeImg, resizeImglogo, create_Company_requests_V, create_Company_requests )

companyroutes.route("/update_Company_requests")
.put(check_login, uploadImages, resizeImg, resizeImglogo,update_Company_requests_V, update_Company_requests )

companyroutes.route("/get_Company_requests")
.get(check_login, check_user_role("admin"), get_Company_requests )

companyroutes.route("/get_Company_requests_id/:id")
.get(check_login, check_user_role("admin"), get_Company_requests_id_V, get_Company_requests_id )

companyroutes.route("/delete_Company_requests/:id")
.delete(check_login, delete_Company_requests_V, delete_Company_requests )

companyroutes.route("/get_Company_requests_my")
.get(check_login, get_Company_requests_my )

companyroutes.route("/Accept_Company_requests_admin/:id")
.post(check_login, check_user_role("admin"), Accept_Company_requests_admin_V, Accept_Company_requests_admin )

companyroutes.route("/delete_Company_requests_admin/:id")
.delete(check_login, check_user_role("admin"), delete_Company_requests_admin_V, delete_Company_requests_admin )




module.exports = companyroutes