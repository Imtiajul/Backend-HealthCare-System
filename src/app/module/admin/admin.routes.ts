import { Router } from "express";
import { AdminController } from "./admin.controller";
import { checkAuth } from "../../lib/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { adminValidation } from "./admin.validation";


const router = Router();

router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AdminController.getAllAdmin);
router.get("/:adminId", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AdminController.getAdminById);
router.patch("/:adminId",  checkAuth(Role.SUPER_ADMIN), validateRequest(adminValidation.updateAdminZodSchema), AdminController.updateAdmin);
router.delete("/:adminId", checkAuth(Role.SUPER_ADMIN), AdminController.softDeleteAdmin);

export const adminRouter = router;