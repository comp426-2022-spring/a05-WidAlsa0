// Route (endpoint) definitions for debug
const express = require("express");
const HTTP_STATUS_OK = 200;

const db = require('../services/database.js')
const debugRoutes = express.Router();

// READ a list of access log records at endpoint /app/log/access
debugRoutes.route('/app/log/access/').get(function (req, res, next) {
    try {
        const stmt = db.prepare('SELECT * FROM accesslogs').all()
        res.status(HTTP_STATUS_OK).json(stmt)
    } catch {
        console.error(res)
    }
});

debugRoutes.route('/app/error/').get(function (req, res, next) {
    throw new Error('Error test successful.') // Express will catch this on its own.
})

module.exports = debugRoutes;