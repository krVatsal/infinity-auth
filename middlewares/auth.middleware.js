const SessionDetail = require("../model/DataModel/sessionDetail");
const UserDetail = require("../model/DataModel/UserDetail");
const ResponseModel = require("../model/reponsemodel");
const HttpErrors = require("../Utils/Constants/http_errors");
const verifyLoggedIn = async (req, res, next) => {
  try {
    const { spid } = req.headers;
    console.log("SPID:", spid);
    if (!spid) {
      return res.json(ResponseModel.setError(HttpErrors.INVALID_CREDENTIALS));
    }
    // const user = await UserDetail.findOne({ _id: cid });
    const session = await SessionDetail.findOne({ _id: spid });
    if (!session) {
      return res.json(ResponseModel.setError(HttpErrors.INVALID_CREDENTIALS));
    }
    return next();
  } catch (e) {
    return res.json(ResponseModel.setError(HttpErrors.DB_ERROR));
  }
};

// const handleByRole = (req, res, next) => {
//   const { role } = req.body; // Assuming you've authenticated the user and have role info
//   console.log("role: ", role);
//   try {
//     switch (role) {
//       case "doctor":
//         req.Model = Doctor;
//         break;
//       case "user":
//         req.Model = UserDetail;
//         break;
//       default:
//         req.Model = UserDetail;
//     }

//     return next();
//   } catch (e) {
//     return res.json(ResponseModel.setError(HttpErrors.INVALID_ROLE));
//   }
// };
module.exports = { verifyLoggedIn };
