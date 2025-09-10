// routes/companies.js (Fixed version)
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const companyController = require('../controllers/companyController');

// Validation rules
const companyValidation = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Company name must be between 2 and 200 characters'),
  body('industry').trim().isLength({ min: 2 }).withMessage('Industry is required'),
  body('size').isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).withMessage('Please select a valid company size'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location is required'),
  body('founded').optional().matches(/^\d{4}$/).withMessage('Founded year must be a 4-digit year'),
  body('website').optional().isURL().withMessage('Please enter a valid website URL'),
  body('email').optional().isEmail().withMessage('Please enter a valid email address'),
  body('phone').optional().trim(),
  body('description').optional().trim()
];

// Routes
router.get('/', auth, companyController.getCompanies);
router.get('/:id', auth, companyController.getCompany);
router.post('/', auth, companyValidation, companyController.addCompany);
router.put('/:id', auth, companyValidation, companyController.updateCompany);
router.delete('/:id', auth, companyController.deleteCompany);

module.exports = router;