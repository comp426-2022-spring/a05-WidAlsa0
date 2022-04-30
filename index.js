//Place your server entry point code here

const START_ARG_NUM = 2
const EXIT_SUCCESS = 0
const DEFAULT_PORT = 3000
const HTTP_STATUS_OK = 200
const HTTP_STATUS_NOT_FOUND = 404

const minimist = require('minimist')
const { exit } = require('process')
const allArguments = minimist(process.argv.slice(START_ARG_NUM))

if (allArguments['help']) {
    console.log(`server.js [options]
    --port	Set the port number for the server to listen on. Must be an integer
                between 1 and 65535.
  
    --debug	If set to \`true\`, creates endpoints /app/log/access/ which returns
                a JSON access log from the database and /app/error which throws 
                an error with the message "Error test successful." Defaults to 
                \`false\`.
  
    --log	If set to false, no log files are written. Defaults to true.
                Logs are always written to database.
  
    --help	Return this message and exit.`)
    exit(EXIT_SUCCESS)
}

const port = allArguments['port'] || process.env.PORT || DEFAULT_PORT

const express = require('express')
const app = express()

const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
})

app.use(express.static('./public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(require('./src/middleware/logging.js'))

// Additional (combined format) logging middleware, if log is true
if (allArguments['log'] == true) {
    // Require the fs and morgan modules
    const fs = require('fs') // TODO: should I put this at the top?
    const morgan = require('morgan')
    // Use morgan for logging to files
    // Create a write stream to append (flags: 'a') to a file
    const loggingStream = fs.createWriteStream('./data/log/access.log', { flags: 'a' })
    // Set up the access logging middleware
    app.use(morgan('combined', { stream: loggingStream }))
}


app.get('/app/', (req, res, next) => {
    res.status(HTTP_STATUS_OK).json({
        'message': "Your API works! (" + HTTP_STATUS_OK + ")"
    })
});

//Coin-flipping
app.use(require("./src/routes/flipRoutes"))

if (allArguments['debug'] == true) {
    app.use(require("./src/routes/debugRoutes"))
}

app.use(function (req, res, next) {
    res.json({ "message": "Endpoint not found. (404)" });
    res.status(HTTP_STATUS_NOT_FOUND);
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server stopped')
    })
})