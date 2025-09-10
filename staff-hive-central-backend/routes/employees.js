// routes/employees.js (Fixed version)
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const employeeController = require('../controllers/employeeController');

// Validation rules
const employeeValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('position').trim().isLength({ min: 2 }).withMessage('Position is required'),
  body('department').trim().isLength({ min: 2 }).withMessage('Department is required'),
  body('salary').isNumeric().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('hireDate').isISO8601().withMessage('Please enter a valid hire date'),
  body('phone').optional().trim(),
  body('status').optional().isIn(['active', 'inactive', 'terminated']).withMessage('Status must be active, inactive, or terminated'),
  body('companyId').optional().isMongoId().withMessage('Invalid company ID')
];

// Routes
router.get('/', auth, employeeController.getEmployees);
router.get('/:id', auth, employeeController.getEmployee);
router.post('/', auth, employeeValidation, employeeController.addEmployee);
router.put('/:id', auth, employeeValidation, employeeController.updateEmployee);
router.patch('/:id/status', auth, [
  body('status').isIn(['active', 'inactive', 'terminated']).withMessage('Status must be active, inactive, or terminated')
], employeeController.updateEmployeeStatus);
router.delete('/:id', auth, employeeController.deleteEmployee);

module.exports = router;