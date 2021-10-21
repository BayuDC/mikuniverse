const errorMessages = {
    NOT_FOUND: 'Data not found',
    INVALID_ID: 'The given id is invalid',
};

module.exports = class MikuniverseError extends Error {
    constructor(code, message) {
        super();
        this.code = code;
        this.message = message ?? errorMessages[this.code];
    }
};
