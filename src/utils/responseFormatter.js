// 성공 응답
const success = (res, data, message = 'Success', meta = {}, statusCode = 200) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data,
        meta,
        timestamp: new Date().toISOString()
    });
};

// 오류 응답
const error = (res, message = 'Error', code = 500, details = null) => {
    return res.status(code).json({
        status: 'error',
        message,
        code,
        details,
        timestamp: new Date().toISOString()
    });
};

// 404 Not Found
const notFound = (res, message = 'Resource not found') => error(res, message, 404);

// 400 Bad Request
const badRequest = (res, message = 'Bad request', details = null) => error(res, message, 400, details);

// 401 Unauthorized
const unauthorized = (res, message = 'Unauthorized') => error(res, message, 401);

module.exports = {
    success,
    error,
    notFound,
    badRequest,
    unauthorized
};
 