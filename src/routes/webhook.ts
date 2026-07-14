import { Router } from "express";
import { handleWebhook } from "../controllers/webhookController";

const router = Router();

router.post("/webhook", handleWebhook);

export default router;
