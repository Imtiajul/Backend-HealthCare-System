import { Router } from "express";
import { specialtyRouter } from "../module/specialty/specialty.routes";
import { authRoutes } from "../module/auth/auth.routes";
import { userRouter } from "../module/user/user.routes";
import { doctorRouter } from "../module/doctor/doctor.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/specialties", specialtyRouter);
routes.use("/users", userRouter);
routes.use("/doctors", doctorRouter);


export const indexRoutes = routes;