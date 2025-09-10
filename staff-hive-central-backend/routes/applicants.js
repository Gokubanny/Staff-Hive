// routes/applicants.js (Fixed version)
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const applicantController = require('../controllers/applicantController');

// Validation rules
const applicantValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Please enter a valid phone number'),
  body('position').trim().isLength({ min: 2 }).withMessage('Position is required'),
  body('experience').isIn(['Entry Level (0-1 years)', 'Junior (1-3 years)', 'Mid-Level (3-5 years)', 'Senior (5-8 years)', 'Lead (8+ years)', 'Executive (10+ years)']).withMessage('Please select a valid experience level'),
  body('expectedSalary').optional().isNumeric().withMessage('Expected salary must be a number'),
  body('location').optional().trim(),
  body('source').optional().trim(),
  body('resume').optional().trim(),
  body('coverLetter').optional().trim(),
  body('notes').optional().trim()
];

const stageValidation = [
  body('stage').isIn(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']).withMessage('Please select a valid stage')
];

// Routes
router.get('/', auth, applicantController.getApplicants);
router.get('/:id', auth, applicantController.getApplicant);
router.post('/', auth, applicantValidation, applicantController.addApplicant);
router.put('/:id', auth, applicantValidation, applicantController.updateApplicant);
router.patch('/:id/stage', auth, stageValidation, applicantController.updateApplicantStage);
router.delete('/:id', auth, applicantController.deleteApplicant);

module.exports = router;