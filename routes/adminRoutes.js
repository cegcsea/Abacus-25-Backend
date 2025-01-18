import express from "express";
const router = express.Router();
import {
  loginValidation,
  addAdminValidation,
  changePasswordValidation,
  workshopUnpaidValidation,
  workshopCashPaymentValidation,
  workshopPaymentValidation,
  workshopListValidation,
  setQueryRepliedValidation,
} from "../validation/adminValidation.js";
import {
  login,
  addAdmin,
  changePassword,
  pendingWorkshopsPayments,
  workshopUnpaid,
  workshopCashPayment,
  workshopPaymentSuccess,
  workshopPaymentFailure,
  workshopRegistrationList,
  workshopPaymentList,
  fetchQueries,
  setQueryReplied,
} from "../controllers/admin.js";

import auth from "../middlewares/adminAuth.js";
router.post("/login", loginValidation, login);
router.post("/add-admin", auth, addAdminValidation, addAdmin);
router.post("/change-password", auth, changePasswordValidation, changePassword);
router.get("/workshops", auth, pendingWorkshopsPayments);
router.post("/workshop-unpaid", auth, workshopUnpaidValidation, workshopUnpaid);
router.post(
  "/workshop-cash-payment",
  auth,
  workshopCashPaymentValidation,
  workshopCashPayment
);
router.post(
  "/workshop-payment-success",
  auth,
  workshopPaymentValidation,
  workshopPaymentSuccess
);
router.post(
  "/workshop-payment-failure",
  auth,
  workshopPaymentValidation,
  workshopPaymentFailure
);
router.post(
  "/workshop-registration-list",
  auth,
  workshopListValidation,
  workshopRegistrationList
);
router.post(
  "/workshop-payment-list",
  auth,
  workshopListValidation,
  workshopPaymentList
);
router.get("/queries", auth, fetchQueries);
router.post(
  "/set-query-replied",
  auth,
  setQueryRepliedValidation,
  setQueryReplied
);
export default router;
