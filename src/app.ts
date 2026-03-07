import express, { Application} from "express";
import { indexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/not-found";
import AppError from "./app/errorHelpers/AppError";
import status from "http-status";
import cookieParser from "cookie-parser";

const app: Application = express();

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
