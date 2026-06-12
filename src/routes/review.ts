import { reviewCode ,getReviews} from "../controllers/reviewController";
import { Router } from "express";


const router = Router();
router.post("/review",reviewCode)
router.get("/reviews",getReviews)

export default router; 