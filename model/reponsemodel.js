class ResponseModel {
    constructor(statusCode, data,message=null ,error = null) {
        this.statusCode = statusCode;
        this.data = data;
        if(message!==null) this.message=message;
        if(error!==null) this.error = error;
    }

    static success(data=null,message=null) {
        return new ResponseModel(200, data,message);
    }

    static created(data,message=null) {
        return new ResponseModel(201, data,message);
    }
    
    static setError(status, message, name) {
        if (typeof status === 'object' && status !== null) {
            const error = status;
            return new ResponseModel(error.status, null, error.message, error.name);
        } else {
            return new ResponseModel(status, null, message, name);
        }
    }
    
}

module.exports = ResponseModel;
