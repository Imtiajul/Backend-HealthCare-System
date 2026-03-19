import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../lib/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


router.post("/register", authController.registerPatient);
router.post("/login", authController.loginUser);
router.get("/me", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR, Role.PATIENT), authController.getMe);

router.get("/refresh-token", authController.getNewToken);
router.post("/change-password", authController.changePassword);
router.post("/logout", authController.logoutUser);

router.post("/verify-email", authController.verifyEmail);
router.post("/forget-password", authController.forgetPassword);
router.post("/reset-password", authController.resetPassword);

router.get("/login/google", authController.googleLogin);
router.get("/google/success", authController.googleLoginSuccess);
router.get("/google/error", authController.handlerOAuthError);


export const authRoutes = router;