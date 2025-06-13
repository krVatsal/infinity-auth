const crypto = require('crypto');
const UserDetail = require("../../model/DataModel/UserDetail");
const sessionDetail = require("../../model/DataModel/sessionDetail");
const redisCache = require("../../services/redisCache");
const cryptoUtil = require("../../Utils/cryptoutil");
const { REDIS_OTP_EXPIRY,REDIS_TOKEN_EXPIRY, DOMAIN } = require("../../config/main");
const {ClientException,BuisnessException}  = require('../../Utils/validators/exceptions');
const RegionInfinityResDTO = require("../../model/resDTO/RegionInfinityResDTO");
const infinityConstants = require("../../Utils/Constants/nosto_constants");
const HttpErrors = require("../../Utils/Constants/http_errors");
const SessionDetail = require("../../model/DataModel/sessionDetail");

 async function login(phone){
    var otp;
    
    // Special case for testing phone number
    if (phone.toString() === "8755799544") {
        otp = "1234"; // Hardcoded OTP for testing
    } else {
        otp = generateOTP();
    }

    await redisCache.setCache(
      phone.toString(),
      otp.toString(),
      120
    );

    // encrypt the phone
    var otpToken = generateOtpToken(phone.toString());
    const message = `OTP sent Successfully to ${phone}`;

    // TODO: sending otp in the response for now. will remove it once we have 3rd party channel to deliver otp integrated

    return RegionInfinityResDTO.success({ otpToken, otp }, message);
} async function verify(otpToken,phone,otp,req,res){
    
    //validate otpToken
    validateOtpToken(otpToken, phone); 

    var stored_otp = await redisCache.getFromCache(phone.toString());
    if(!stored_otp) throw new ClientException(infinityConstants.EXPIRED_OTP);

    // Special case for testing phone number - accept hardcoded OTP
    if (phone.toString() === "3488392432" && otp === "1234") {
        // Skip OTP validation for testing number
    } else {
        if (otp != stored_otp) throw new ClientException(infinityConstants.INVALID_OTP);
    }
    

    const user = await UserDetail.findOne({ phone_number: phone });
    if (user) {
      if (user.is_fully_registered) {
       

        const session = await createSessionInDB(user);
        
        const authToken = await generateAuthToken(user._id.toString(),session._id.toString(),user.role);

        redisCache.setCache(session._id.toString(),authToken,REDIS_TOKEN_EXPIRY);

        populateCookie(res,infinityConstants.AUTH_COOKIE, authToken);
        populateCookie(res,infinityConstants.CID_COOKIE, user._id.toString());
        populateCookie(res,infinityConstants.SPID_COOKIE, session._id.toString()); 
      
        return RegionInfinityResDTO.success({ user, authToken, refreshToken:session.refresh_token, spid:session._id},"User already exist");
      } else {
        // ACCOUNT EXIST WITH FULLY REIGSTERED - FALSE
        console.log(user); 
        return RegionInfinityResDTO.success({ user},infinityConstants.ACCOUNT_EXIST);
      }
    } else {
      //ACCOUNT DOES NOT EXIST
      const newUser = new UserDetail({ phone_number: phone });
      const savedUser = await newUser.save();
      console.log("saved user: " + savedUser);
      return RegionInfinityResDTO.created({ user:savedUser},infinityConstants.ACCOUNT_CREATED);
    }
 
}

async function createSessionInDB(user){
  const refreshToken = generateRefreshToken(user);

  const session = new sessionDetail({
    user_id: user._id,
    refresh_token: refreshToken,
    expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
  }); 
  return await session.save();
}



function validateOtpToken(otpToken, phone) {
      var token_json = decryptToken(otpToken);
      var token_phone = token_json.phone;
      if (token_phone != phone) throw new ClientException(infinityConstants.OTP_TOKEN_INVALID);
}





  function generateOtpToken(phone) {
    var raw_token = { phone: phone, time: Date.now(),randomString: cryptoUtil.generateRandomString() };
    return cryptoUtil.encrypt(JSON.stringify(raw_token));
  }
  function generateRefreshToken(user) {
    var raw_token = { id: user._id,role:user.role,time: Date.now(),randomString: cryptoUtil.generateRandomString() };
    return cryptoUtil.encrypt(JSON.stringify(raw_token));
  }
  function generateAuthToken(cid,spid,role) {
    var raw_token = { cid: cid,spid:spid,role:role, time: Date.now(),randomString: cryptoUtil.generateRandomString() };
    return cryptoUtil.encrypt(JSON.stringify(raw_token));
  }  function decryptToken(token){
    try{
      var decrypted_value = cryptoUtil.decrypt(token);
      var token_json = JSON.parse(decrypted_value);
      return token_json;
    }catch(error){
      throw new ClientException(infinityConstants.INVALID_ENCRYPTED_TOKEN);
    }
  }


  function generateOTP() {
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp.toString(); 
  }

  function populateCookie(res,name,value){
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const options = {
      httpOnly: true, // Makes the cookie accessible only through HTTP(S) requests, not JavaScript
      expires: expiryDate, // Expiry date of the cookie, 30 days from now
      domain: DOMAIN,
      path: '/', // Path within the domain where the cookie is accessible
    };
    res.cookie(name,value,options);
  }

  
  
  
module.exports = {
  login,
  verify,
  createSessionInDB,
  generateAuthToken,
  generateRefreshToken,
  populateCookie,
  decryptToken
}

