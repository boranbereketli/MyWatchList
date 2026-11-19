import "dotenv/config";
import dotenv from "dotenv";
import express, { Express, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createDatabase, createTables } from "./queries";
import { authenticateToken, authRouter } from "./auth";
import { userRouter } from "./user";
import { showRouter } from "./show";
import { adminRouter } from "./admin";
import { rateLimit, securityHeaders } from "./security";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.static("public"));
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
// 20 login/register attempts per IP per 15 minutes
app.use(["/auth/login", "/auth/register"], rateLimit(20, 15 * 60 * 1000));
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/show", showRouter);
app.use("/admin", adminRouter);

const initializeDatabase = async () => {
  await createDatabase();
  await createTables();
};
// Without a working database the API cannot do anything useful, so fail loudly instead of crashing later.
initializeDatabase().catch((err) => {
  console.error("Database initialization failed:", err.message);
  process.exit(1);
});

// Example of a Protected Route
app.get("/protected", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    message: "You have accessed a protected route!",
    user: req.user,
  });
});

/* Start the Express app and listen
 for incoming requests on the specified port */
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
