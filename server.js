const express = require('express');
const app = express();
const url = require('url');
const { fork } = require('child_process');

/**
 * Enabling cross-origin resource sharing
 */
app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-requestuested-With, Content-Type, Accept");
    next();
});

let loadCalculatorFork;
let isServerStarted = false;

/**
 * Express route to start the server to calculate system load
 */
app.get('/start/:time?', function (request, response) {
    response.type('application/json');
    if (!isServerStarted) {
        // Creating child process for computing system load
        loadCalculatorFork = fork('LoadCalculator.js');
        // Starting the child process to calcualate system load for user defined time or for 1000ms 
        loadCalculatorFork.send(["start", request.params.time || 1000]);
        // When the child process(fork) return value we need to send back if the responseponce is given for
        // the starting process
        loadCalculatorFork.on('message', forkReponseData => {
            if (forkReponseData.initiatedFor == "start") {
                console.log("inside server outpus");
                response.end(JSON.stringify(forkReponseData.value));
            }
        });
        isServerStarted = true;
    }else{
        console.log(loadCalculatorFork.killed);
        response.status(400).send({
            message: 'Server already started! use getInfo to get system load calculation'
        });
    }
})

/**
 * Express route to return calculated system load value
 */
app.get('/getInfo', function (request, response) {
    //response.setHeader('Content-Type', 'application/json');
    response.type('application/json');
    if (loadCalculatorFork) {
        loadCalculatorFork.send(["getInfo"]);
        // When the child process(fork) return value we need to send back if the responseponce is given for
        // the getInfo process
        loadCalculatorFork.on('message', forkReponseData => {
            if (forkReponseData.initiatedFor == "getInfo") {
                response.end(JSON.stringify(forkReponseData.value));
            }
        });
    } else {
        response.status(400).send({
            message: 'System load calculation not yet started!. Please start the system load calculation'
        });
    }
})

/**
 * Express route to stop calculating system load by killing child node server
 */
app.get('/stop', function (request, response) {
    response.type('application/json');
    loadCalculatorFork.kill();
    isServerStarted = false;
    response.end(JSON.stringify({ status: "success" }));
})

/**
 * Starting node server on port 1337
 */
app.listen(1337);
console.log("System load calculator api is running on port 1337");