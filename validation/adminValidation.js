import Joi from 'joi';
const loginSchema = Joi.object({
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

const loginValidation = (req, res, next) => {
    const { error } = adminSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    next();
};

const addAdminValidation = (req, res, next) => {
    const { error } = adminSchema.validate(req.body);
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

export {
    loginValidation,
    addAdminValidation,
    changePasswordValidation,
    workshopUnpaidValidation,
    workshopCashPaymentValidation,
    workshopPaymentValidation,
    workshopListValidation,
    setQueryRepliedValidation
};
