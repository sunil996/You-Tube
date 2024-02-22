class ApiResponse {
    constructor(statusCode, message = "Success", data=null){
        this.statusCode = statusCode
        this.success = statusCode < 400 ? true : false;
        this.message = message
        this.data = data
       
    }
}

module.exports={ApiResponse};