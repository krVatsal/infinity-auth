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
const cookieParser = require('cookie-parser');
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
} 
async function verify(otpToken,phone,otp,req,res){
    
    //validate otpToken
    validateOtpToken(otpToken, phone); 

    var stored_otp = await redisCache.getFromCache(phone.toString());
    if(!stored_otp) throw new ClientException(infinityConstants.EXPIRED_OTP);

    // Special case for testing phone number - accept hardcoded OTP
    if (phone.toString() === "8755799544" && otp === "1234") {
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
      
        return RegionInfinityResDTO.success({ user, authToken, refreshToken:session.refresh_token, spid:session._id, cid: user._id},"User already exist");
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

async function completeSignup(userId, name, email, res) {
    try {

        // Find user
        const user = await UserDetail.findById(userId);
        if (!user) {
            throw new ClientException(HttpErrors.USER_NOT_FOUND.status, HttpErrors.USER_NOT_FOUND.message, HttpErrors.USER_NOT_FOUND.name);
        }

        // Check if user is already fully registered
        if (user.is_fully_registered) {
            throw new ClientException(HttpErrors.INVALID_REQUEST.status, "User is already fully registered", HttpErrors.INVALID_REQUEST.name);
        }

                const session = await createSessionInDB(user);
        
        const authToken = await generateAuthToken(user._id.toString(),session._id.toString(),user.role);

        redisCache.setCache(session._id.toString(),authToken,REDIS_TOKEN_EXPIRY);

        populateCookie(res,infinityConstants.AUTH_COOKIE, authToken);
        populateCookie(res,infinityConstants.CID_COOKIE, user._id.toString());
        populateCookie(res,infinityConstants.SPID_COOKIE, session._id.toString()); 

        // Update user with name and email
        user.name = name;
        user.email = email;
        user.is_fully_registered = true;
        user.updated_at = new Date();
        await user.save();

        return RegionInfinityResDTO.success({
            user_id: user._id,
            phone_number: user.phone_number,
            name: user.name,
            email: user.email,
            is_fully_registered: user.is_fully_registered,
            role: user.role,
            authToken:authToken,
            refreshToken:session.refresh_token, 
            spid:session._id, 
            cid: user._id

        }, "Signup completed successfully");

    } catch (error) {
        console.error("Error in completeSignup function:", error);
        if (error instanceof ClientException || error instanceof BuisnessException) {
            return RegionInfinityResDTO.setError(error);
        }
        return RegionInfinityResDTO.setError(HttpErrors.SERVER_ERROR.status, HttpErrors.SERVER_ERROR.message, HttpErrors.SERVER_ERROR.name);
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
  }  
  function decryptToken(token){
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
      // httpOnly: true, // Makes the cookie accessible only through HTTP(S) requests, not JavaScript
      expires: expiryDate, // Expiry date of the cookie, 30 days from now
      domain: DOMAIN,
      path: '/', // Path within the domain where the cookie is accessible
    };
    res.cookie(name,value,options);
    console.log(`Cookie set: ${name}=${value}`);
  }

  async function postProfile(req, res) {
  const { Id, email, age } = req.body; //note that the entire body will be assigned
  //to the user detail (email and age are destructured just for clarity)

  try {
    const user = await req.Model.findOne({ _id: Id });
    console.log(user.is_fully_registered);
    if (user) {
      if (user.is_fully_registered) {
        console.log("something here");
        const session = await createSessionInDB(user);
        const authToken = await generateAuthToken(
          user._id.toString(),
          session._id.toString()
        );
        res.cookie("auth", authToken);
        res.cookie("cid", user._id);
        res.cookie("spid", session._id);

        return res.json(
          responseModel.success(
            {
              user,
              authToken,
              refreshToken: session.refresh_token,
              spid: session._id,
            },
            "User already exist"
          )
        );
      } else {
        // ACCOUNT EXIST WITH FULLY REIGSTERED - FALSE

        user.is_fully_registered = true;
        Object.assign(user.detail, req.body);
        console.log(user.is_fully_registered);
        await user
          .save()
          .then((item) => {
            res.send(user);
            console.log("Item saved to database");
          })
          .catch((err) => {
            res.status(400).send("unable to save to database");
          });
      }
    } else {
      res.send("please login and verify first");
    }
  } catch (error) {
    console.log(error);

    if (error instanceof ClientException) {
      response = responseModel.fail({
        name: HttpErrors.INVALID_INPUT.name,
        message: error.message,
      });
    } else {
      response = responseModel.setError({
        name: HttpErrors.SERVER_ERROR.name,
        message: HttpErrors.SERVER_ERROR.message,
        status: HttpErrors.SERVER_ERROR.status,
      });
    }
  }
}
async function logout(req, res) {
  try {
    const { spid } = req.headers;

    if (!spid) {
      return res
        .status(400)
        .json(responseModel.setError(400, "SPID is required.", "InvalidInput"));
    }
    await sessionDetail.findByIdAndDelete(spid);
    // Clear cookies
    res.clearCookie(nostoConstants.AUTH_COOKIE, {
      domain: DOMAIN,
      path: "/",
    });
    res.clearCookie(nostoConstants.CID_COOKIE, {
      domain: DOMAIN,
      path: "/",
    });
    res.clearCookie(nostoConstants.SPID_COOKIE, {
      domain: DOMAIN,
      path: "/",
    });

    return res.json(
      responseModel.success(
        null,
        "User successfully logged out. All session data cleared."
      )
    );
  } catch (error) {
    console.error("Error during logout:", error);

    if (error instanceof ClientException) {
      response = responseModel.setError({
        name: HttpErrors.INVALID_INPUT.name,
        message: error.message,
      });
    } else {
      response = responseModel.setError({
        name: HttpErrors.SERVER_ERROR.name,
        message: HttpErrors.SERVER_ERROR.message,
        status: HttpErrors.SERVER_ERROR.status,
      });
    }

    return res.status(500).json(response);
  }
}

async function refreshAuthToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json(
      responseModel.setError({
        message: "Refresh token is required.",
      })
    );
  }

  try {
    // Decrypt and validate the refresh token
    const tokenData = decryptToken(refreshToken);
    const { id: userId, role } = tokenData;
    console.log("tokenData extracted", tokenData);
    // Find the session associated with this refresh token
    const session = await sessionDetail.findOne({
      user_id: userId,
      refresh_token: refreshToken,
    });

    if (!session) {
      throw new ClientException(nostoConstants.INVALID_REFRESH_TOKEN);
    }

    // Generate a new access token
    const authToken = generateAuthToken(userId, session._id.toString(), role);
    console.log("auth token generated", authToken);
    // Update the session's expiry time
    session.expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // Extend by 30 days
    await session.save();
    console.log("session saved");
    // Store the new auth token in Redis cache
    await redisCache.setCache(
      session._id.toString(),
      authToken,
      REDIS_TOKEN_EXPIRY
    );

    // Populate cookies with the new auth token
    populateCookie(res, nostoConstants.AUTH_COOKIE, authToken);
    populateCookie(res, nostoConstants.CID_COOKIE, userId);
    populateCookie(res, nostoConstants.SPID_COOKIE, session._id.toString());
    console.log("cookies populated");
    return res.json(
      responseModel.success(
        {
          authToken,
          refreshToken: session.refresh_token,
          spid: session._id,
        },
        "Access token refreshed successfully."
      )
    );
  } catch (error) {
    console.error("Error refreshing access token:", error);

    if (error instanceof ClientException) {
      return res.status(400).json(
        responseModel.setError({
          name: error.name,
          message: error.message,
        })
      );
    } else {
      return res.status(500).json(
        responseModel.setError({
          name: "ServerError",
          message: "An error occurred while refreshing the access token.",
          status: 500,
        })
      );
    }
  }
}
const verifyCredentials = async (req, res) => {
  try {
    const { spid, cid, refreshToken } = req.headers;

    console.log("SPID:", spid);
    if (!spid || !cid || !refreshToken) {
      return res.json(ResponseModel.setError(HttpErrors.INVALID_CREDENTIALS));
    }
    // const user = await UserDetail.findOne({ _id: cid });
    const session = await SessionDetail.findOne({ _id: spid, refreshToken });
    if (!session) {
      return res.json(ResponseModel.setError(HttpErrors.INVALID_CREDENTIALS));
    }

    const user = await UserDetail.findOne({ _id: cid });
    if (!user) {
      return res.json(ResponseModel.setError(HttpErrors.INVALID_CREDENTIALS));
    }

    return res.status(200).json(
      ResponseModel.success({
        data: { user, session },
        message: "Credentials verified successfully",
      })
    );
  } catch (e) {
    return res.json(ResponseModel.setError(HttpErrors.DB_ERROR));
  }
};
  
module.exports = {
  login,
  verify,
  createSessionInDB,
  generateAuthToken,
  generateRefreshToken,
  populateCookie,
  decryptToken,
  completeSignup,
  refreshAuthToken,
  verifyCredentials
}

