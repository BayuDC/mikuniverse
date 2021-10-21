const errorMessages = {
    NOT_FOUND: 'Data not found',
    INVALID_ID: 'The given id is invalid',
    TIME_OUT: 'Upload failed due to slow connection, please try again!',
};

module.exports = class MikuniverseError extends Error {
    constructor(code, message) {
        super();
        this.code = code;
        this.message = message ?? errorMessages[this.code];
    }
};
