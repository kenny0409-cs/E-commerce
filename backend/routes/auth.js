import express from "express";
import { DeleteUser, forgotPassword, getUserDetail, getUserProfile, getallUsers, loginUser, logoutUser, registerUser, resetPassword, updatePassword, updateProfile, updateUserDetail } from "../controllers/authControllers.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);

router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser,getUserProfile);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser,updateProfile);
router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"),getallUsers);


router.route("/admin/users/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"),getUserDetail)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserDetail)
    .delete(isAuthenticatedUser,authorizeRoles("admin"),DeleteUser);


export default router;