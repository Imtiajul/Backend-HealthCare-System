import { Router } from "express";
import { specialtyRouter } from "../module/specialty/specialty.routes";
import { authRoutes } from "../module/auth/auth.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/specialty", specialtyRouter);


export const indexRoutes = routes;