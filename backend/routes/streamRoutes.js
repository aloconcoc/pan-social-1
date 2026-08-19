import express from "express";
import { getStreamToken } from "../controllers/streamController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);

export default router;
