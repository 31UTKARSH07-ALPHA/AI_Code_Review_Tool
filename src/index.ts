import dotenv from "dotenv";
dotenv.config();
import express from "express";
import reviewRouter from "./routes/review";
import logger from "./lib/logger";
import { globalLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";

const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());
app.use(requestLogger)
app.use(globalLimiter);

app.use("/api", reviewRouter);

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});