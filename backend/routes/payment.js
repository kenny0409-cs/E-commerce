import express from "express";

const router = express.Router();

import {isAuthenticatedUser } from "../middlewares/auth.js";
import { StripeWebhook, stripeCheckoutSession } from "../controllers/paymentController.js";

router.route("/payment/checkout_session").post(isAuthenticatedUser,stripeCheckoutSession);

router.route("/payment/webhook").post(StripeWebhook);


export default router;