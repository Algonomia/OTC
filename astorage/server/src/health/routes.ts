import { Router } from "express";
import { healthStatus } from "./health.controller";

const router = Router();
router.get('/health', healthStatus);

export default router;
