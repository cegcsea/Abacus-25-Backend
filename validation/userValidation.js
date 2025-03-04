import joi from "joi";

// Schemas
const getRegistrationLinkSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.base": "Email must be a string.",
    "string.email":
      "Invalid email format. Please provide a valid email address.",
  }),
});
const registerSchema = joi.object({
  name: joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  email: joi.string().required().messages({
    "string.empty": "Invalid Link",
  }),
  token: joi.string().required().messages({
    "string.empty": "Invalid Link",
  }),
  mobile: joi
    .string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be of 10 digits",
      "string.empty": "Mobile number is required",
    }),
  dept: joi
    .string()
    .required()
    .regex(/^[A-Za-z ]+$/)
    .messages({
      "string.empty": "Department is required",
      "string.pattern.base":
        "Invalid department name. Only characters are allowed.",
    }),
  year: joi.number().required().min(1).max(5).messages({
    "number.base": "Year must be a number",
    "number.empty": "Year is required",
    "number.min": "Year must be atleast 1",
    "number.max": "Year must be atmost 5",
  }),
  college: joi.string().required().messages({
    "string.empty": "College is required",
  }),
  // hostCollege: joi.string().required().messages({
  //   "string.empty": "College is required",
  // }),
  password: joi
    .string()
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
  accomodation: joi.boolean().required().messages({
    "boolean.empty": "Accomodation choice required",
  }),
  
    referralCode: joi.string().allow('').optional().messages({
        'string.base': 'Referral Code must be a string'
    })
});
const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.base": "Email must be a string.",
    "string.email":
      "Invalid email format. Please provide a valid email address.",
  }),
  password: joi.string().required().messages({
    "string.base": "Password must be a string.",
    "string.empty": "Password is required.",
  }),
});
const forgotPasswordSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.base": "Email must be a string.",
    "string.email":
      "Invalid email format. Please provide a valid email address.",
  }),
});
const resetPasswordSchema = joi.object({
  newPassword: joi
    .string()
    .required()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$!%#*?&]{8,}$/
    )
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).",
    }),
  confirmPassword: joi
    .string()
    .required()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{8,}$/
    )
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).",
    }),
  userId: joi.string().required().messages({
    "string.empty": "Invalid Link",
  }),
  token: joi.string().required().messages({
    "string.empty": "Invalid Link",
  }),
});
const changePasswordSchema = joi.object({
  password: joi
    .string()
    .required()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@$#!%*?&]{8,}$/
    )
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).",
    }),
  newPassword: joi
    .string()
    .required()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$#!%*?&]{8,}$/
    )
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).",
    }),
});
const eventRegisterSchema = joi.object({
  eventId: joi
    .number()
    .strict()
    .precision(0)
    .min(1)
    .max(7)
    .required()
    .messages({
      "number.base": "Event Id must be a number",
      "number.empty": "Event Id is required",
      "number.precision": "Event Id must be a number",
      "number.min": "Event Id should range between 1 and 20",
      "number.max": "Event Id should range between 1 and 20",
    }),
});
const workshopRegisterSchema = joi.object({
  workshopId: joi
    .number()
    .strict()
    .precision(0)
    .min(1)
    .max(3)
    .required()
    .messages({
      "number.empty": "Workshop Id is required",
      "number.base": "Workshop Id must be a number",
      "number.precision": "Workshop Id must be a number",
      "number.min": "Workshop Id should range between 1 and 2",
      "number.max": "Workshop Id should range between 1 and 2",
    }),
});
const workshopPaymentSchema = joi.object({
  workshopId: joi
    .number()
    .strict()
    .precision(0)
    .min(1)
    .max(3)
    .required()
    .messages({
      "any.required": "Workshop Id is required",
      "number.base": "Workshop Id must be a number",
      "number.precision": "Workshop Id must be a number",
      "number.min": "Workshop Id should range between 1 and 2",
      "number.max": "Workshop Id should range between 1 and 2",
    }),
  paymentMobile: joi
    .string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "Payment Mobile must be a string",
      "string.pattern.base": "Payment Mobile must be of 10 digits",
      "any.required": "Payment Mobile is required",
    }),
  transactionId: joi.string().required().messages({
    "string.base": "Transaction ID must be a string",
    "any.required": "Transaction ID is required",
  }),
  users: joi.array().items(joi.number().integer()).required().messages({
    "array.base": "Input must be an array",
    "number.base": "Each id in the array must be a number",
    "number.integer": "Each id in the array must be an integer",
  }),
});
const eventPaymentSchema = joi.object({
  eventId: joi
    .number()
    .strict()
    .precision(0)
    .min(1)
    .max(13)
    .required()
    .messages({
      "any.required": "Event Id is required",
      "number.base": "Event Id must be a number",
      "number.precision": "Event Id must be a number",
      "number.min": "Event Id should range between 1 and 13",
      "number.max": "Event Id should range between 1 and 13",
    }),
  paymentMobile: joi
    .string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.base": "Payment Mobile must be a string",
      "string.pattern.base": "Payment Mobile must be of 10 digits",
      "any.required": "Payment Mobile is required",
    }),
  transactionId: joi.string().required().messages({
    "string.base": "Transaction ID must be a string",
    "any.required": "Transaction ID is required",
  }),
  users: joi.array().items(joi.number().integer()).required().messages({
    "array.base": "Input must be an array",
    "number.base": "Each id in the array must be a number",
    "number.integer": "Each id in the array must be an integer",
  }),
});
const updateProfileSchema = joi.object({
  name: joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  mobile: joi
    .string()
    .required()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Mobile number must be of 10 digits",
      "string.empty": "Mobile number is required",
    }),
  dept: joi.string().required().messages({
    "string.empty": "Department is required",
  }),
  year: joi.number().required().min(1).max(5).messages({
    "number.base": "Year must be a number",
    "number.empty": "Year is required",
    "number.min": "Year must be atleast 1",
    "number.max": "Year must be atmost 5",
  }),
  college: joi.string().required().messages({
    "string.empty": "College is required",
  }),
});
const querySchema = joi.object({
  name: joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  title: joi.string().required().messages({
    "string.empty": "Title is required",
  }),
  message: joi.string().required().messages({
    "string.empty": "Message is required",
  }),
  email: joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.base": "Email must be a string.",
    "string.email":
      "Invalid email format. Please provide a valid email address.",
  }),
});

const accomodationDetailsSchema = joi.object({
  day0: joi.boolean().required().messages({
    "boolean.empty": "Day 0 choice is required",
  }),
  day1: joi.boolean().required().messages({
    "boolean.empty": "Day 1 choice is required",
  }),
  day2: joi.boolean().required().messages({
    "boolean.empty": "Day 2 choice is required",
  }),
  day3: joi.boolean().required().messages({
    "boolean.empty": "Day 3 choice is required",
  }),
  food: joi.boolean().required().messages({
    "boolean.empty": "Food choice is required",
  }),
  amount: joi.number().required().messages({
    "number.base": "Year must be a number",
    "number.empty": "Year is required",
  }),
});
// Validation functions
export const getRegistrationLinkValidation = (req, res, next) => {
  const { error } = getRegistrationLinkSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
  }
  next();
};

export const registerValidation = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
  }
  next();
};

export const loginValidation = (req, res, next) => {
  console.log("Login Request Body:", req.body);
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
  }
  next();
};

export const forgotPasswordValidation = (req, res, next) => {
  const { error } = forgotPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
  }
  next();
};

export const resetPasswordValidation = (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
  }
  next();
};

export const changePasswordValidation = (req, res, next) => {
  const { error } = changePasswordSchema.validate(req.body);
  console.log(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
  }
  next();
};

export const eventRegisterValidation = (req, res, next) => {
  const { error } = eventRegisterSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
  }
  next();
};

export const workshopRegisterValidation = (req, res, next) => {
  const { error } = workshopRegisterSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
  }
  next();
};

export const workshopPaymentValidation = (req, res, next) => {
  const { error } = workshopPaymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
  }
  next();
};

export const updateProfileValidation = (req, res, next) => {
  console.log(req.body);
  const { error } = updateProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
  }
  next();
};

export const queryValidation = (req, res, next) => {
  const { error } = querySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
  }
  next();
};
export const eventPaymentValidation = (req, res, next) => {
  const { error } = eventPaymentSchema.validate(req.body);
  console.log(req.body);
  if (error) {
    res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
    return;
  }
  next();
};
export const accomodationDetailsValidation = (req, res, next) => {
  const { error } = accomodationDetailsSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      status: "error",
      error: "Bad request",
      message: error.details[0].message,
    });
    return;
  }
  next();
};
