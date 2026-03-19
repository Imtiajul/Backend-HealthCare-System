import express, { Application, urlencoded} from "express";
import { indexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/not-found";
import AppError from "./app/errorHelpers/AppError";
import status from "http-status";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from "cors"
import { envVars } from "./app/config/env";
import QueryString from "qs";

const app: Application = express();
app.set("query parser", (str: string) => QueryString.parse(str)); 

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.use(cors({
    origin: [envVars.BETTER_AUTH_URL, envVars.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use("/api/auth", toNodeHandler(auth));

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Basic route
app.use('/api/v1/', indexRoutes);

app.get('/', () => {
    throw new AppError(status.BAD_REQUEST, "Just testing error handler");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
