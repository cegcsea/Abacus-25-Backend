import express from "express";
import auth from "../middlewares/adminAuth.js";
import upload from "../middlewares/upload.js";
import {
  loginValidation,
  addAdminValidation,
  changePasswordValidation,
  workshopUnpaidValidation,
  workshopCashPaymentValidation,
  workshopPaymentValidation,
  workshopListValidation,
  setQueryRepliedValidation,
  updateUserValidation,
  fetchUserValidation,
  eventPaymentValidation,
  eventCashPaymentValidation,
  eventUnpaidValidation,
  registerEventValidation,
  registerCaValidation,
  registerUserValidation,
  eventListValidation,
  eventPaymentListValidation,
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
  eventRegistrationList,
  Register,
  registerCa,
  eventsUnregistered,
  registerEvent,
  pendingEventsPayments,
  eventUnpaid,
  eventCashPayment,
  eventPaymentSuccess,
  eventPaymentFailure,
  fetchUser,
  updateUser,
  eventPaymentList,
  referralCodeDetails,
  fetchAllUsers,
  sendOlpcLink,
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
router.post("/add-admin", auth, addAdminValidation, addAdmin);
router.put("/change-password", auth, changePasswordValidation, changePassword);
router.get("/pendingWorkshopsPayments", auth, pendingWorkshopsPayments);
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
  "/event-registration-list",
  auth,
  eventListValidation,
  eventRegistrationList
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
router.post("/register-user", auth, registerUserValidation, Register);
router.post("/register-ca", auth, registerCaValidation, registerCa);
router.post(
  "/event-unregistered-list",
  auth,
  eventListValidation,
  eventsUnregistered
);
router.post("/event-register", auth, registerEventValidation, registerEvent);
router.post(
  "/event-payment-list",
  auth,
  eventPaymentListValidation,
  eventPaymentList
);
router.get("/pendingEventsPayments", auth, pendingEventsPayments);
router.post("/event-unpaid", auth, eventUnpaidValidation, eventUnpaid);
router.post(
  "/event-cash-payment",
  auth,
  eventCashPaymentValidation,
  eventCashPayment
);
router.post(
  "/event-payment-success",
  auth,
  eventPaymentValidation,
  eventPaymentSuccess
);
router.post(
  "/event-payment-failure",
  auth,
  eventPaymentValidation,
  eventPaymentFailure
);
router.post("/fetch-user", auth, fetchUserValidation, fetchUser);
router.put("/update-user", auth, updateUserValidation, updateUser);
router.get("/referral-code-details", auth, referralCodeDetails);
router.get("/fetch-all-users", auth, fetchAllUsers);
router.get("/send-olpc-link", auth, sendOlpcLink);

export default router;
