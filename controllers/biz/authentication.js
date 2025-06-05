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

module.exports = router;