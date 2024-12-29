class ClientException extends Error {
    constructor(message) {
        super(message);
        this.name = 'ClientException'; 
    }
}


class BuisnessException extends Error {
    constructor(message) {
        super(message);
        this.name = 'BuisnessException'; 
    }
}
module.exports ={
    ClientException,
    BuisnessException
}