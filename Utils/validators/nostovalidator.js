function validatePhoneNumber(phoneNumber) {
    if (!/^\d+$/.test(phoneNumber)) {
        return false; 
    }
    if (phoneNumber.length === 10) {
        return true; 
    } else {
        return false;
    }
}

module.exports={
    validatePhoneNumber
}