import { Router } from "express";
import { handleWebhook } from "../controllers/webHookController";

const router = Router();

router.post("/webhook", handleWebhook);

export default router;
