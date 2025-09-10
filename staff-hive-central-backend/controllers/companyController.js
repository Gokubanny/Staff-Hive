// controllers/companyController.js (Fixed version)
const Company = require('../models/Company');
const { validationResult } = require('express-validator');

// Get all companies for logged-in user
exports.getCompanies = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = { userId: req.user.userId };
    
    const skip = (page - 1) * limit;
    
    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Company.countDocuments(query);
    
    // Filter by search term if provided
    let filteredCompanies = companies;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchLower) ||
        company.industry.toLowerCase().includes(searchLower) ||
        company.location.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      data: filteredCompanies,
      count: filteredCompanies.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
      error: error.message
    });
  }
};

// Get single company
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company',
      error: error.message
    });
  }
};

// Add new company
exports.addCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if company with same name already exists for this user
    const existingCompany = await Company.findOne({
      name: req.body.name.trim(),
      userId: req.user.userId
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this name already exists'
      });
    }

    const companyData = {
      ...req.body,
      userId: req.user.userId
    };
    
    const newCompany = new Company(companyData);
    await newCompany.save();
    
    res.status(201).json({
      success: true,
      message: 'Company added successfully',
      data: newCompany
    });
  } catch (error) {
    console.error('Error adding company:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Company with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error adding company',
      error: error.message
    });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updatedCompany = await Company.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating company',
      error: error.message
    });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    const deletedCompany = await Company.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!deletedCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting company',
      error: error.message
    });
  }
};