const success = (data, message = 'Success', meta = {}) => {
    return {
        status: 'success',
        message,
        data,
        meta, 
        timestamp: new Date().toISOString()
    };
};

const error = (message = 'Error', code = 500, details = null) => {
    return {
        status: 'error',
        message,
        code,
        details, 
        timestamp: new Date().toISOString()
    };
};

const notFound = (message = 'Resource not found') => error(message, 404);
const badRequest = (message = 'Bad request', details = null) => error(message, 400, details);
const unauthorized = (message = 'Unauthorized') => error(message, 401);

module.exports = {
    success,
    error,
    notFound,
    badRequest,
    unauthorized
};
