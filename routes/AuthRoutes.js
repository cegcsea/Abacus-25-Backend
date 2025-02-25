import express from "express";
import auth from "../middlewares/userAuth.js";
import upload from "../middlewares/upload.js";
import upload2 from "../middlewares/upload2.js";
import {
  getRegistrationLinkValidation,
  registerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
  queryValidation,
} from "../validation/userValidation.js";

import {
  getRegistrationLink,
  Register,
  Login,
  forgotPassword,
  forgotPasswordReset,
  changePassword,
  profile,
  updateProfile,
  postQuery,
  accomodationDetails
} from "../controllers/Auth.js";
import {
  eventRegisterValidation,
  workshopRegisterValidation,
  workshopPaymentValidation,
  eventPaymentValidation,
  accomodationDetailsValidation
} from "../validation/userValidation.js";
import {
  eventRegister,
  getEvents,
  workshopRegister,
  getWorkshops,
  verifyWorkshopPaymentDetails,
  workshopPaymentScreenshot,
  verifyEventPaymentDetails,
  eventPaymentScreenshot
} from "../controllers/Event.js";

const router = express.Router();

router.post(
  "/get-registration-link",
  getRegistrationLinkValidation,
  getRegistrationLink
);
router.post("/register/:email/:token", registerValidation, Register);
router.post(
  "/get-password-reset-link",
  forgotPasswordValidation,
  forgotPassword
);
router.post(
  "/reset-password/:userId/:token",
  resetPasswordValidation,
  forgotPasswordReset
);
router.post("/login", Login);
router.put("/change-password", auth, changePasswordValidation, changePassword);
router.get("/profile", auth, profile);
router.post("/event-register", auth, eventRegisterValidation, eventRegister);
router.get("/get-events", auth, getEvents);
router.post(
  "/workshop-register",
  auth,
  workshopRegisterValidation,
  workshopRegister
);
router.get("/get-workshops", auth, getWorkshops);
router.post(
  "/verify-workshop-payment-details",
  auth,
  workshopPaymentValidation,
  verifyWorkshopPaymentDetails
);
router.post('/verify-event-payment-details', auth, eventPaymentValidation, verifyEventPaymentDetails)
router.post(
  "/workshop-payment-screenshot/:workshopPaymentId",
  auth,
  upload.single("paymentScreenshot"),
  workshopPaymentScreenshot
);
router.post('/event-payment-screenshot/:eventPaymentId', auth, upload2.single('paymentScreenshot'), eventPaymentScreenshot)
router.put("/update-profile", auth, updateProfileValidation, updateProfile);
router.post("/post-query", queryValidation, postQuery);
router.post(
  "/accomodation-details",
  auth,
  accomodationDetailsValidation,
  accomodationDetails
);


export default router;
