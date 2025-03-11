import Joi from 'joi';
const loginSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.base': 'Email must be a string.',
        'string.email': 'Invalid email format. Please provide a valid email address.',
    }),
    password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$!#%*?&]{8,}$/).messages({
        'string.base': 'Password must be a string.',
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 8 characters long.',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).',
    })
});

const adminSchema = Joi.object({
  
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.base': 'Email must be a string.',
        'string.email': 'Invalid email format. Please provide a valid email address.'
    }),
    password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%#*?&]{8,}$/).message({
        'string.empty': 'Password is required.',
        'string.base': 'Password must be a string.',
        'string.min': 'Password must be at least 8 characters long.',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@,#,!,%,*,?,&,$).'
    })
});

const changePasswordSchema = Joi.object({
    password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*#?&]{8,}$/).messages({
        'string.base': 'Password must be a string.',
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 8 characters long.',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).',
    }),
    newPassword: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*#?&]{8,}$/).messages({
        'string.base': 'Password must be a string.',
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 8 characters long.',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).',
    })
});

const workshopUnpaidSchema = Joi.object({
    workshopId: Joi.number().strict().precision(0).min(1).max(2).required().messages({
        'any.required': 'Workshop Id is required',
        'number.base': 'Workshop Id must be a number',
        'number.precision': 'Workshop Id must be a number',
        'number.min': 'Workshop Id should range between 1 and 2',
        'number.max': 'Workshop Id should range between 1 and 2'
    })
});

const workshopCashPaymentSchema = Joi.object({
    userId: Joi.number().strict().precision(0).min(1).required().messages({
        'number.base': 'User Id must be a number',
        'number.empty': 'User Id is required',
        'number.precision': 'User Id must be a number',
        'number.min': 'User Id must be atleast 1'
    }),
    workshopId: Joi.number().strict().precision(0).min(1).max(2).required().messages({
        'any.required': 'Workshop Id is required',
        'number.base': 'Workshop Id must be a number',
        'number.precision': 'Workshop Id must be a number',
        'number.min': 'Workshop Id should range between 1 and 2',
        'number.max': 'Workshop Id should range between 1 and 2'
    })
});

const workshopPaymentSchema = Joi.object({
    transactionId: Joi.string().required().messages({
        'string.base': 'Transaction ID must be a string',
        'string.empty': 'Transaction ID is required',
        'any.required': 'Transaction ID is required',
    })
});

const workshopListSchema = Joi.object({
    workshopId: Joi.number().strict().precision(0).min(1).max(2).required().messages({
        'any.required': 'Workshop Id is required',
        'number.base': 'Workshop Id must be a number',
        'number.precision': 'Workshop Id must be a number',
        'number.min': 'Workshop Id should range between 1 and 2',
        'number.max': 'Workshop Id should range between 1 and 2'
    })
});

const setQueryRepliedSchema = Joi.object({
    id: Joi.number().strict().precision(0).required().messages({
        'any.required': 'Query Id is required',
        'number.base': 'Workshop Id must be a number',
        'number.precision': 'Workshop Id must be a number',
    })
});

const registerUserSchema = joi.object({
    name: joi.string().required().messages({
        'string.empty': 'Name is required'
    }),
    email: joi.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.base': 'Email must be a string.',
        'string.email': 'Invalid email format. Please provide a valid email address.',
    }),
    mobile: joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Mobile number must be of 10 digits',
        'string.empty': 'Mobile number is required'
    }),
    dept: joi.string().required().regex(/^[A-Za-z ]+$/).messages({
        'string.empty': 'Department is required',
        'string.pattern.base': 'Invalid department name. Only characters are allowed.'
    }),
    year: joi.number().required().min(1).max(5).messages({
        'number.base': 'Year must be a number',
        'number.empty': 'Year is required',
        'number.min': 'Year must be atleast 1',
        'number.max': 'Year must be atmost 5'
    }),
    college: joi.string().required().messages({
        'string.empty': 'College is required'
    }),
    password: joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%#*?&]{8,}$/).messages({
        'string.base': 'Password must be a string.',
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 8 characters long.',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@,#,!,%,*,?,&,$).',
    }),
    accomodation: joi.boolean().required().messages({
        'boolean.empty': 'Accomodation choice is required'
    }),
    referralCode: joi.string().allow('').optional().messages({
        'string.base': 'Referral Code must be a string'
    })
})
const registerCaSchema = joi.object({
    name: joi.string().required().messages({
        'string.empty': 'Name is required'
    }),
    college: joi.string().required().messages({
        'string.empty': 'College is required'
    }),
    email: joi.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.base': 'Email must be a string.',
        'string.email': 'Invalid email format. Please provide a valid email address.',
    })
})
const registerEventSchema = joi.object({
    eventId: joi.number().strict().precision(0).min(1).max(20).required().messages({
        'any.required': 'Event Id is required',
        'number.base': 'Event Id must be a number',
        'number.precision': 'Event Id must be a number',
        'number.min': 'Event Id should range between 1 and 20',
        'number.max': 'Event Id should range between 1 and 20'
    }),
    userId: joi.number().strict().precision(0).min(1).required().messages({
        'number.base': 'User Id must be a number',
        'number.empty': 'User Id is required',
        'number.precision': 'User Id must be a number',
        'number.min': 'User Id must be atleast 1'
    })
})
const eventUnpaidSchema = joi.object({
    workshopId: joi.number().strict().precision(0).min(1).max(20).required().messages({
        'any.required': 'Event Id is required',
        'number.base': 'Event Id must be a number',
        'number.precision': 'Event Id must be a number',
        'number.min': 'Event Id should range between 1 and 20',
        'number.max': 'Event Id should range between 1 and 20'
    })
})
const eventCashPaymentSchema = joi.object({
    users: joi.array().items(joi.number().integer()).required().messages({
        'array.base': 'Input must be an array',
        'number.base': 'Each id in the array must be a number',
        'number.integer': 'Each id in the array must be an integer',
    }),
    workshopId: joi.number().strict().precision(0).min(1).max(20).required().messages({
        'any.required': 'Event Id is required',
        'number.base': 'Event Id must be a number',
        'number.precision': 'Event Id must be a number',
        'number.min': 'Event Id should range between 1 and 20',
        'number.max': 'Event Id should range between 1 and 20'
    }),
    day0: joi.boolean().optional().messages({
        'boolean.empty': 'Day 0 choice is required'
    }),
    day1: joi.boolean().optional().messages({
        'boolean.empty': 'Day 1 choice is required'
    }),
    day2: joi.boolean().optional().messages({
        'boolean.empty': 'Day 2 choice is required'
    }),
    day3: joi.boolean().optional().messages({
        'boolean.empty': 'Day 3 choice is required'
    }),
    food: joi.boolean().optional().messages({
        'boolean.empty': 'Food choice is required'
    })
})
const eventPaymentSchema = joi.object({
    id: joi.number().required().messages({
        'number.base': 'ID must be a number',
        'string.empty': 'ID is required',
        'any.required': 'ID is required',
    })
})
const fetchUserSchema = joi.object({
    abacusId: joi.number().strict().precision(0).min(1).max(3000).required().messages({
        'any.required': 'Abacus Id is required',
        'number.base': 'Abacus Id must be a number',
        'number.precision': 'Abacus Id must be a number',
        'number.min': 'Abacus Id should range between 1 and 3000',
        'number.max': 'Abacus Id should range between 1 and 3000'
    })
})
const updateUserSchema = joi.object({
    abacusId: joi.number().strict().precision(0).min(1).max(3000).required().messages({
        'any.required': 'Abacus Id is required',
        'number.base': 'Abacus Id must be a number',
        'number.precision': 'Abacus Id must be a number',
        'number.min': 'Abacus Id should range between 1 and 3000',
        'number.max': 'Abacus Id should range between 1 and 3000'
    }),
    name: joi.string().required().messages({
        'string.empty': 'Name is required'
    }),
    mobile: joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Mobile number must be of 10 digits',
        'string.empty': 'Mobile number is required'
    }),
    dept: joi.string().required().regex(/^[A-Za-z ]+$/).messages({
        'string.empty': 'Department is required',
        'string.pattern.base': 'Invalid department name. Only characters are allowed.'
    }),
    year: joi.number().required().min(1).max(5).messages({
        'number.base': 'Year must be a number',
        'number.empty': 'Year is required',
        'number.min': 'Year must be atleast 1',
        'number.max': 'Year must be atmost 5'
    }),
    college: joi.string().required().messages({
        'string.empty': 'College is required'
    }),
    accomodation: joi.boolean().required().messages({
        'boolean.empty': 'Accomodation choice is required'
    }),
    referralCode: joi.string().allow('').optional().messages({
        'string.base': 'Referral Code must be a string'
    }),
});

const loginValidation = (req, res, next) => {
    const { error } = adminSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    next();
};

const addAdminValidation = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    next();
};

const changePasswordValidation = (req, res, next) => {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    next();
};

const workshopUnpaidValidation = (req, res, next) => {
    const { error } = workshopUnpaidSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    next();
};

const workshopCashPaymentValidation = (req, res, next) => {
    const { error } = workshopCashPaymentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    next();
};

const workshopPaymentValidation = (req, res, next) => {
    const { error } = workshopPaymentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    next();
};

const workshopListValidation = (req, res, next) => {
    const { error } = workshopListSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    next();
};

const setQueryRepliedValidation = (req, res, next) => {
    const { error } = setQueryRepliedSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    next();
};

const registerUserValidation = (req, res, next) => {
    const { error } = registerUserSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    next();
}
const registerCaValidation = (req, res, next) => {
    const { error } = registerCaSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
        return;
    }
    next();
}
const registerEventValidation = (req, res, next) => {
    const { error } = registerEventSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
        return;
    }
    next();
}
const eventUnpaidValidation = (req, res, next) => {
    const { error } = eventUnpaidSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
        return;
    }
    next();
}
const eventCashPaymentValidation = (req, res, next) => {
    const { error } = eventCashPaymentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
        return;
    }
    next();
}
const eventPaymentValidation = (req, res, next) => {
    const { error } = eventPaymentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
        return;
    }
    next();
}
const fetchUserValidation = (req, res, next) => {
    const { error } = fetchUserSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
        return;
    }
    next();
}
const updateUserValidation = (req, res, next) => {
    const { error } = updateUserSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
        return;
    }
    next();
}

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
    registerUserValidation
};
