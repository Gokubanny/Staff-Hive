// routes/payroll.js (Fixed version)
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const payrollController = require('../controllers/payrollController');

// Validation rules
const payrollValidation = [
  body('employeeId').isMongoId().withMessage('Valid employee ID is required'),
  body('employeeName').trim().isLength({ min: 2 }).withMessage('Employee name is required'),
  body('baseSalary').isNumeric().isFloat({ min: 0 }).withMessage('Base salary must be a positive number'),
  body('overtime').optional().isNumeric().isFloat({ min: 0 }).withMessage('Overtime must be a positive number'),
  body('bonuses').optional().isNumeric().isFloat({ min: 0 }).withMessage('Bonuses must be a positive number'),
  body('deductions').optional().isObject().withMessage('Deductions must be an object'),
  body('totalAmount').isNumeric().isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('period').matches(/^\d{4}-\d{2}$/).withMessage('Period must be in YYYY-MM format'),
  body('status').optional().isIn(['pending', 'processing', 'completed', 'failed']).withMessage('Invalid status')
];

const generatePayrollValidation = [
  body('employeeIds').isArray({ min: 1 }).withMessage('At least one employee ID is required'),
  body('employeeIds.*').isMongoId().withMessage('All employee IDs must be valid'),
  body('period').optional().matches(/^\d{4}-\d{2}$/).withMessage('Period must be in YYYY-MM format')
];

// Routes
router.get('/', auth, payrollController.getPayrollRecords);
router.get('/:id', auth, payrollController.getPayrollRecord);
router.post('/', auth, payrollValidation, payrollController.addPayrollRecord);
router.post('/generate', auth, generatePayrollValidation, payrollController.generatePayroll);
router.put('/:id', auth, payrollValidation, payrollController.updatePayrollRecord);
router.patch('/:id/status', auth, [
  body('status').isIn(['pending', 'processing', 'completed', 'failed']).withMessage('Invalid status')
], payrollController.updatePayrollStatus);
router.delete('/:id', auth, payrollController.deletePayrollRecord);

module.exports = router;