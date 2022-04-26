// Focus div based on nav button click

// Flip one coin and show coin image to match result when button clicked

// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series

// Guess a flip by clicking either heads or tails button

const express = require('express')
const app = express()

const arguments = require('minimist')(process.argv.slice(2))

const db = require('./database.js')

const morgan = require('morgan')

const fs = require('fs')

app.use(express.urlencoded({ extended: true}));
app.use(express.json());


const port = arguments.port || process.env.port || 5000

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
});

app.get('/app/', (req, res, next) => {
  // Respond with status 200
      res.statusCode = 200;
  // respond with status message "OK"
      res.statusMessage = "Your API works!";
      res.writeHead(res.statusCode, {'Content-Type' : 'text/plain'})
      res.end(res.statusCode + ' ' + res.statusMessage);
      
  })
  
if (arguments.log == 'false'){
  console.log("not creating access.log")
} else{
  const WRITESTREAM = fs.createWriteStream('access.log', { flags: 'a' })
  // Set up the access logging middleware
  app.use(morgan('combined', { stream: WRITESTREAM }))
  
}

// Store help text 
const help = (`
server.js [options]
--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help	Return this message and exit.
`)

if (arguments.help || arguments.h) {
  console.log(help)
  process.exit(0)
}

app.use( (req, res, next) => {
  let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referer: req.headers['referer'],
      useragent: req.headers['user-agent']
  }
  console.log(logdata)
  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
  next();
});




if (arguments.debug || arguments.d){
    app.get('/app/log/access/', (req, res, next) => {
    const stmt = db.prepare('SELECT * FROM accesslog').all()
    res.status(200).json(stmt)

    })
    app.get('/app/error/', (req, res, next) => {
      throw new Error('Error')
    })
}




app.get('/app/flip/', (req, res) => {
   var flip = coinFlip()
   res.status(200).json({ 'flip' : flip })
})  


app.get('/app/flips/:number', (req, res) => {
    const finalFlips = coinFlips(req.params.number)
    res.status(200).json({ 'raw': finalFlips, 'summary': countFlips(finalFlips) })

}
)

app.get('/app/flip/call/heads', (req, res) => {
    const flipRandomCoin = flipACoin("heads")
    res.status(200).json( {"call": flipRandomCoin.call, "flip": flipRandomCoin.flip, "result": flipRandomCoin.result})
})

app.get('/app/flip/call/tails', (req, res) => {
    const flipRandomCoin = flipACoin("tails")
    res.status(200).json( {"call": flipRandomCoin.call, "flip": flipRandomCoin.flip, "result": flipRandomCoin.result})
})



// Default response for any other request
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')

})



// If --help or -h, echo help text to STDOUT and exit


function coinFlip() {
  return (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';
}

function coinFlips(flips) {
    const array = [];
    for (let i =0; i<flips; i++) {
      array[i] = coinFlip();
    }
    return array
  }

function countFlips(array) {
 let heads = 0;
 let tails = 0;
 for (let i =0; i<array.length; i++) {
   if (array[i].charAt[0] == 't') {
        tails = tails + 1
    } else {
         heads = heads + 1
   }
}
  
    if (heads == 0) {
      return { tails: tails}
    } else if (tails == 0) {
      return { heads: heads}
    }
  
    return { 'heads': heads, 'tails': tails }
 }

function flipACoin(call) {
    let flip = coinFlip()
    let outcome = ''
    if (flip == call) {
      outcome = 'win'
    } else {
      outcome = 'lose'
    }
    return { 'call': call, 'flip': flip, 'result': outcome }
  }