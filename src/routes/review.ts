import { reviewCode ,getReviews, getReviewById} from "../controllers/reviewController";
import { Router } from "express";


const router = Router();
router.post("/review",reviewCode)
router.get("/reviews",getReviews)
router.get("/reviews/:id",getReviewById)

export default router;