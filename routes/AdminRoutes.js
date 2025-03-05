import express from "express";
import auth from "../middlewares/adminAuth.js";
import upload from "../middlewares/upload.js";
import {
  loginValidation,
  changePasswordValidation,
  addAdminValidation,
  setQueryRepliedValidation,
} from "../validation/adminValidation.js";

import {
  login,
  addAdmin,
  changePassword,
  fetchQueries,
  setQueryReplied,
  pendingWorkshopsPayments,
  workshopUnpaid,
  workshopCashPayment,
  workshopPaymentSuccess,
  workshopPaymentFailure,
  workshopRegistrationList,
  workshopPaymentList,
  eventRegistrationList,
  Register,
} from "../controllers/admin.js";

import {
  getEvents,
  getWorkshops,
  workshopPaymentScreenshot,
} from "../controllers/Event.js";
import { profile } from "../controllers/Auth.js";

const router = express.Router();

// Define your routes here

router.post("/login", loginValidation, login);
router.put("/change-password", auth, changePasswordValidation, changePassword);
router.get("/get-events", auth, getEvents);
router.post("/add-admin", auth, addAdminValidation, addAdmin);
router.get("/get-workshops", getWorkshops);
router.get("/queries", auth, fetchQueries);
router.put(
  "/set-query-replied",
  auth,
  setQueryRepliedValidation,
  setQueryReplied
);
router.post("/register-user", auth, Register);
router.get("/pendingWorkshopsPayments", auth, pendingWorkshopsPayments);
router.post("/workshop-unpaid", auth, workshopUnpaid);
router.post("/workshop-cash-payment", auth, workshopCashPayment);
router.post("/workshop-payment-success", auth, workshopPaymentSuccess);
router.post("/workshop-payment-failure", auth, workshopPaymentFailure);
router.post("/workshop-registration-list", auth, workshopRegistrationList);
router.post("/event-registration-list", eventRegistrationList);
router.post("/workshop-payment-list", auth, workshopPaymentList);

router.post(
  "/workshop-payment-screenshot/:workshopPaymentId",
  auth,
  upload.single("paymentScreenshot"),
  workshopPaymentScreenshot
);

export default router;
