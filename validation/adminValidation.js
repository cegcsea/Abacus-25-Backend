import Joi from "joi";
const loginSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.base": "Email must be a string.",
    "string.email":
      "Invalid email format. Please provide a valid email address.",
  }),
  password: Joi.string()
    .required()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$!#%*?&]{8,}$/
    )
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).",
    }),
});

const adminSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.base": "Email must be a string.",
    "string.email":
      "Invalid email format. Please provide a valid email address.",
  }),
  password: Joi.string()
    .required()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%#*?&]{8,}$/
    )
    .message({
      "string.empty": "Password is required.",
      "string.base": "Password must be a string.",
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@,#,!,%,*,?,&,$).",
    }),
});

const changePasswordSchema = Joi.object({
  password: Joi.string()
    .required()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*#?&]{8,}$/
    )
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).",
    }),
  newPassword: Joi.string()
    .required()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*#?&]{8,}$/
    )
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).",
    }),
});

const workshopUnpaidSchema = Joi.object({
  workshopId: Joi.number()
    .strict()
    .precision(0)
    .min(1)
    .max(3)
    .required()
    .messages({
      "any.required": "Workshop Id is required",
      "number.base": "Workshop Id must be a number",
      "number.precision": "Workshop Id must be a number",
      "number.min": "Workshop Id should range between 1 and 3",
      "number.max": "Workshop Id should range between 1 and 3",
    }),
});

const workshopCashPaymentSchema = Joi.object({
  //   userId: Joi.number().strict().precision(0).min(1).required().messages({
  //     "number.base": "User Id must be a number",
  //     "number.empty": "User Id is required",
  //     "number.precision": "User Id must be a number",
  //     "number.min": "User Id must be atleast 1",
  //   }),
  users: Joi.array().items(Joi.number().integer()).required().messages({
    "array.base": "Input must be an array",
    "number.base": "Each id in the array must be a number",
    "number.integer": "Each id in the array must be an integer",
  }),
  workshopId: Joi.number()
    .strict()
    .precision(0)
    .min(1)
    .max(3)
    .required()
    .messages({
      "any.required": "Workshop Id is required",
      "number.base": "Workshop Id must be a number",
      "number.precision": "Workshop Id must be a number",
      "number.min": "Workshop Id should range between 1 and 3",
      "number.max": "Workshop Id should range between 1 and 3",
    }),
});

const workshopPaymentSchema = Joi.object({
  transactionId: Joi.string().required().messages({
    "string.base": "Transaction ID must be a string",
    "string.empty": "Transaction ID is required",
    "any.required": "Transaction ID is required",
  }),
});

const workshopListSchema = Joi.object({
  workshopId: Joi.number()
    .strict()
    .precision(0)
    .min(1)
    .max(3)
    .required()
    .messages({
      "any.required": "Workshop Id is required",
      "number.base": "Workshop Id must be a number",
      "number.precision": "Workshop Id must be a number",
      "number.min": "Workshop Id should range between 1 and 3",
      "number.max": "Workshop Id should range between 1 and 3",
    }),
});

const setQueryRepliedSchema = Joi.object({
  id: Joi.number().strict().precision(0).required().messages({
    "any.required": "Query Id is required",
    "number.base": "Workshop Id must be a number",
    "number.precision": "Workshop Id must be a number",
  }),
});

const registerUserSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.base": "Email must be a string.",
    "string.email":
      "Invalid email format. Please provide a valid email address.",
  }),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be of 10 digits",
      "string.empty": "Mobile number is required",
    }),
  dept: Joi.string()
    .required()
    .regex(/^[A-Za-z ]+$/)
    .messages({
      "string.empty": "Department is required",
      "string.pattern.base":
        "Invalid department name. Only characters are allowed.",
    }),
  year: Joi.number().required().min(1).max(5).messages({
    "number.base": "Year must be a number",
    "number.empty": "Year is required",
    "number.min": "Year must be atleast 1",
    "number.max": "Year must be atmost 5",
  }),
  college: Joi.string().required().messages({
    "string.empty": "College is required",
  }),
  password: Joi.string()
    .required()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%#*?&]{8,}$/
    )
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).",
    }),
  accomodation: Joi.boolean().required().messages({
    "boolean.empty": "Accomodation choice is required",
  }),
  referralCode: Joi.string().allow("").optional().messages({
    "string.base": "Referral Code must be a string",
  }),
});
const registerCaSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  college: Joi.string().required().messages({
    "string.empty": "College is required",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.base": "Email must be a string.",
    "string.email":
      "Invalid email format. Please provide a valid email address.",
  }),
});
const registerEventSchema = Joi.object({
  eventId: Joi.number()
    .strict()
    .precision(0)
    .min(1)
    .max(21)
    .required()
    .messages({
      "any.required": "Event Id is required",
      "number.base": "Event Id must be a number",
      "number.precision": "Event Id must be a number",
      "number.min": "Event Id should range between 1 and 21",
      "number.max": "Event Id should range between 1 and 21",
    }),
  userId: Joi.number().strict().precision(0).min(1).required().messages({
    "number.base": "User Id must be a number",
    "number.empty": "User Id is required",
    "number.precision": "User Id must be a number",
    "number.min": "User Id must be atleast 1",
  }),
});

const eventListSchema = Joi.object({
  eventId: Joi.number()
    .strict()
    .precision(0)
    .min(1)
    .max(21)
    .required()
    .messages({
      "any.required": "Event Id is required",
      "number.base": "Event Id must be a number",
      "number.precision": "Event Id must be a number",
      "number.min": "Event Id should range between 1 and 21",
      "number.max": "Event Id should range between 1 and 21",
    }),
});
const eventPaymentListSchema = Joi.object({
  EventId: Joi.number()
    .strict()
    .precision(0)
    .min(1)
    .max(21)
    .required()
    .messages({
      "any.required": "Event Id is required",
      "number.base": "Event Id must be a number",
      "number.precision": "Event Id must be a number",
      "number.min": "Event Id should range between 1 and 21",
      "number.max": "Event Id should range between 1 and 21",
    }),
});
const eventUnpaidSchema = Joi.object({
  EventId: Joi.number()
    .strict()
    .precision(0)
    .min(1)
    .max(21)
    .required()
    .messages({
      "any.required": "Event Id is required",
      "number.base": "Event Id must be a number",
      "number.precision": "Event Id must be a number",
      "number.min": "Event Id should range between 1 and 21",
      "number.max": "Event Id should range between 1 and 21",
    }),
});
const eventCashPaymentSchema = Joi.object({
  users: Joi.array().items(Joi.number().integer()).required().messages({
    "array.base": "Input must be an array",
    "number.base": "Each id in the array must be a number",
    "number.integer": "Each id in the array must be an integer",
  }),
  EventId: Joi.number()
    .strict()
    .precision(0)
    .min(1)
    .max(21)
    .required()
    .messages({
      "any.required": "Event Id is required",
      "number.base": "Event Id must be a number",
      "number.precision": "Event Id must be a number",
      "number.min": "Event Id should range between 1 and 21",
      "number.max": "Event Id should range between 1 and 21",
    }),
  day0: Joi.boolean().optional().messages({
    "boolean.empty": "Day 0 choice is required",
  }),
  day1: Joi.boolean().optional().messages({
    "boolean.empty": "Day 1 choice is required",
  }),
  day2: Joi.boolean().optional().messages({
    "boolean.empty": "Day 2 choice is required",
  }),
  day3: Joi.boolean().optional().messages({
    "boolean.empty": "Day 3 choice is required",
  }),
  food: Joi.boolean().optional().messages({
    "boolean.empty": "Food choice is required",
  }),
});
const eventPaymentSchema = Joi.object({
  transactionId: Joi.string().required().messages({
    "string.base": "Transaction ID must be a string",
    "string.empty": "Transaction ID is required",
    "any.required": "Transaction ID is required",
  }),
});
const fetchUserSchema = Joi.object({
  abacusId: Joi.number()
    .strict()
    .precision(0)
    .min(1)
    .max(3000)
    .required()
    .messages({
      "any.required": "Abacus Id is required",
      "number.base": "Abacus Id must be a number",
      "number.precision": "Abacus Id must be a number",
      "number.min": "Abacus Id should range between 1 and 3000",
      "number.max": "Abacus Id should range between 1 and 3000",
    }),
});
const updateUserSchema = Joi.object({
  abacusId: Joi.number()
    .strict()
    .precision(0)
    .min(1)
    .max(3000)
    .required()
    .messages({
      "any.required": "Abacus Id is required",
      "number.base": "Abacus Id must be a number",
      "number.precision": "Abacus Id must be a number",
      "number.min": "Abacus Id should range between 1 and 3000",
      "number.max": "Abacus Id should range between 1 and 3000",
    }),
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be of 10 digits",
      "string.empty": "Mobile number is required",
    }),
  dept: Joi.string()
    .required()
    .regex(/^[A-Za-z ]+$/)
    .messages({
      "string.empty": "Department is required",
      "string.pattern.base":
        "Invalid department name. Only characters are allowed.",
    }),
  year: Joi.number().required().min(1).max(5).messages({
    "number.base": "Year must be a number",
    "number.empty": "Year is required",
    "number.min": "Year must be atleast 1",
    "number.max": "Year must be atmost 5",
  }),
  college: Joi.string().required().messages({
    "string.empty": "College is required",
  }),
  accomodation: Joi.boolean().required().messages({
    "boolean.empty": "Accomodation choice is required",
  }),
  referralCode: Joi.string().allow("").optional().messages({
    "string.base": "Referral Code must be a string",
  }),
});

const loginValidation = (req, res, next) => {
  const { error } = adminSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }
  next();
};

const addAdminValidation = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }
  next();
};

const changePasswordValidation = (req, res, next) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }
  next();
};

const workshopUnpaidValidation = (req, res, next) => {
  const { error } = workshopUnpaidSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }
  next();
};

const workshopCashPaymentValidation = (req, res, next) => {
  const { error } = workshopCashPaymentSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }
  next();
};

const workshopPaymentValidation = (req, res, next) => {
  const { error } = workshopPaymentSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }
  next();
};

const workshopListValidation = (req, res, next) => {
  const { error } = workshopListSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }
  next();
};

const setQueryRepliedValidation = (req, res, next) => {
  const { error } = setQueryRepliedSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }
  next();
};

const registerUserValidation = (req, res, next) => {
  const { error } = registerUserSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }
  next();
};
const registerCaValidation = (req, res, next) => {
  const { error } = registerCaSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
    return;
  }
  next();
};
const registerEventValidation = (req, res, next) => {
  const { error } = registerEventSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
    return;
  }
  next();
};
const eventUnpaidValidation = (req, res, next) => {
  const { error } = eventUnpaidSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
    return;
  }
  next();
};
const eventCashPaymentValidation = (req, res, next) => {
  const { error } = eventCashPaymentSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
    return;
  }
  next();
};
const eventPaymentValidation = (req, res, next) => {
  const { error } = eventPaymentSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
    return;
  }
  next();
};
const fetchUserValidation = (req, res, next) => {
  const { error } = fetchUserSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
    return;
  }
  next();
};
const updateUserValidation = (req, res, next) => {
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
    return;
  }
  next();
};
const eventListValidation = (req, res, next) => {
  console.log(eventListSchema.validate({ eventId: 21 })); // should be valid
  const { error } = eventListSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
    return;
  }
  next();
};
const eventPaymentListValidation = (req, res, next) => {
  const { error } = eventPaymentListSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
    return;
  }
  next();
};
export {
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
};
