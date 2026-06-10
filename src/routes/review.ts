import { reviewCode } from "../controllers/reviewController";
import { Router } from "express";


const router = Router();
router.post("/review",reviewCode)

export default router;