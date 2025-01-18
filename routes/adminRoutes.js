import express from "express";
import auth from "../middlewares/adminAuth.js";
import upload from "../middlewares/upload.js";
import {
  
  loginValidation,
  changePasswordValidation,
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
  workshopPaymentList
} from "../controllers/admin.js";

import {
  getEvents,
  getWorkshops,
  workshopPaymentScreenshot,
} from "../controllers/Event.js";
import { profile } from "../controllers/Auth.js";


const AdminRouter = express.Router();

// Define your routes here



router.post("/login",login);
router.put('/change-password/:id', changePassword);
router.get("/get-events", auth, getEvents);
router.post("/add-admin",addAdmin);
router.get("/get-workshops", getWorkshops);
router.get("/queries",fetchQueries)
router.put("/reply",setQueryReplied)
router.get("/pendingWorkshopsPayments",pendingWorkshopsPayments)
router.post('/workshop-unpaid', workshopUnpaid)
router.post('/workshop-cash-payment', workshopCashPayment)
router.post('/workshop-payment-success', workshopPaymentSuccess)
router.post('/workshop-payment-failure', workshopPaymentFailure)
router.post('/workshop-registration-list',workshopRegistrationList)
router.post('/workshop-payment-list', workshopPaymentList)

router.post(
  "/workshop-payment-screenshot/:workshopPaymentId",
  auth,
  upload.single("paymentScreenshot"),
  workshopPaymentScreenshot
);


export default AdminRouter;