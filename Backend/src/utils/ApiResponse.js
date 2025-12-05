class ApiResponse {
    constructor(statusCode, data,emailsent,OTP,accessToken,refreshToken, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        if(emailsent){
            this.emailsent = true
        }
        else{
            this.emailsent = null
        }
        if(OTP){
            this.OTP=OTP
        }
        else{
            this.OTP=null
        }
        if(accessToken){
            this.accessToken = accessToken
        }
        else{
            this.accessToken = null
        }
        if (refreshToken) {
            this.refreshToken = refreshToken
        }
        else{
            this.refreshToken = null

        }
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }