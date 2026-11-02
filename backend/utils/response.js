// Standard JSON responses for the equipment module.
// Same shape as the laboratory controller, plus a top-level "message"
// on errors so frontend/js/api.js can display it.

const ok = (res, data, status = 200) =>
    res.status(status).json({
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            count: Array.isArray(data) ? data.length : 1
        }
    });

const fail = (res, code, message, status) =>
    res.status(status).json({
        success: false,
        message,
        error: { code, message }
    });

module.exports = { ok, fail };