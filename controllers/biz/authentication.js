const express = require('express');
const router = express.Router();
const authTool = require('../tools/authentication_tool');
const RegionInfinityResDTO = require("../../model/resDTO/RegionInfinityResDTO");
const {ClientException, BuisnessException} = require('../../Utils/validators/exceptions');
const nostoValidator = require('../../Utils/validators/nostovalidator');
const HttpErrors = require("../../Utils/Constants/http_errors");

// Login endpoint - sends OTP to phone number
router.post('/login', async (req, res) => {
    try {
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json(RegionInfinityResDTO.setError(400, "Phone number is required", "ValidationError"));
        }
        
        if (!nostoValidator.validatePhoneNumber(phone)) {
            return res.status(400).json(RegionInfinityResDTO.setError(400, "Invalid phone number format", "ValidationError"));
        }
        
        const result = await authTool.login(phone);
        res.status(result.statusCode).json(result);
        
    } catch (error) {
        console.error('Login error:', error);
        if (error instanceof ClientException || error instanceof BuisnessException) {
            res.status(400).json(RegionInfinityResDTO.setError(400, error.message, error.name));
        } else {
            res.status(500).json(RegionInfinityResDTO.setError(HttpErrors.GENERAL_ERROR));
        }
    }
});

// Verify OTP endpoint
router.post('/verify', async (req, res) => {
    try {
        const { otpToken, phone, otp } = req.body;
        
        if (!otpToken || !phone || !otp) {
            return res.status(400).json(RegionInfinityResDTO.setError(400, "OTP token, phone number, and OTP are required", "ValidationError"));
        }
        
        const result = await authTool.verify(otpToken, phone, otp, req, res);
        res.status(result.statusCode).json(result);
        
    } catch (error) {
        console.error('Verify error:', error);
        if (error instanceof ClientException || error instanceof BuisnessException) {
            res.status(400).json(RegionInfinityResDTO.setError(400, error.message, error.name));
        } else {
            res.status(500).json(RegionInfinityResDTO.setError(HttpErrors.GENERAL_ERROR));
        }
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { userId, name, email } = req.body;
    
        // Validate required fields
        if (!userId || !name || !email) {
            return res.status(400).json({
                statusCode: 400,
                message: 'User ID, name and email are required',
                error: 'BAD_REQUEST'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Invalid email format',
                error: 'INVALID_EMAIL'
            });
        }

        // Validate name (should not be empty and should contain only letters and spaces)
                if (!name.trim() || !/^[a-zA-Z\s]+$/.test(name.trim())) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Name should contain only letters and spaces',
                error: 'INVALID_NAME'
            });
        }

        const result = await authTool.completeSignup(userId, name.trim(), email.toLowerCase(), res);
        res.status(result.statusCode).json(result);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
        });
    }
});

module.exports = router;