const { body, validationResult, header } = require('express-validator')


exports.registerValidate = [
    body('email')
        .exists()
        .isEmail().withMessage('email should not be empty')
        .trim(),
    function(req, res, next) {
        var errorValidation = validationResult(req);
        if(!errorValidation.isEmpty()) {
            return res.status(400).json(errorValidation.array().pop().msg);
        }
        next()
    },
    body('password')
        .exists()
        .isLength({min: 7}).withMessage('password length should be more then 7')
        .trim(),
    function(req, res, next) {
        var errorValidation = validationResult(req);
        if(!errorValidation.isEmpty()) {
            return res.status(400).json(errorValidation.array().pop().msg);
        }
        next()
    },
    body('userType')
        .exists().withMessage('userType should be defined')
        .trim(),
    function(req, res, next) {
        var errorValidation = validationResult(req);
        if(!errorValidation.isEmpty()) {
            return res.status(400).json(errorValidation.array().pop().msg);
        }
        next()
    }
]



exports.validateSignIn = [
    body('email')
        .exists()
        .isEmail().withMessage('email should not be empty')
        .trim(),
    function(req, res, next) {
        var errorValidation = validationResult(req);
        if(!errorValidation.isEmpty()) {
            return res.status(400).json(errorValidation.array().pop().msg);
        }
        next()
    },
    body('password')
        .exists()
        .isLength({min: 7}).withMessage('password length should be more then 7')
        .trim(),
    function(req, res, next) {
        var errorValidation = validationResult(req);
        if(!errorValidation.isEmpty()) {
            return res.status(400).json(errorValidation.array().pop().msg);
        }
        next()
    },
    body('userType')
        .exists().withMessage('userType should be defined')
        .trim(),
    function(req, res, next) {
        var errorValidation = validationResult(req);
        if(!errorValidation.isEmpty()) {
            return res.status(400).json(errorValidation.array().pop().msg);
        }
        next()
    }
]