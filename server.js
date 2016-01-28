var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var expressapp     = express();
var bodyParser = require('body-parser');
var exec = require('child_process').exec;
var cookieParser = require('cookie-parser');

//Configuring middleware
expressapp.use(cookieParser());
expressapp.use(bodyParser())

//Maps requests to the ./public folder for static assets
expressapp.use(express.static('public'));

//Maps the assets request to the resources/js file
expressapp.use('/assets', express.static(__dirname + '/public/resources'));

//Demo of Cheerio
expressapp.get('/basicGet', function(req, res){
    console.log('Get made...');
    var $ = cheerio.load('<h1> Congratulaitons you won!');
    res.send( $.html());
})

//Demo of Request to post a form
expressapp.post('/doPost', function(req, res){
    console.log(req);
    console.log('name: ' + req.param('username'));

    res.send('The post was successful: ' + req.param('username'));
})


expressapp.get('/hitGenerator', function(req, res){
    var file = fs.readFileSync('public/index.html','UTF-8');
    file = file.replace('doPost', 'hitGenerator');
    res.send(file);
})

//Demo of Request to hit a URL
expressapp.post('/hitGenerator', function(req, res){
    var url = "https://" + req.param('username') + ":"+ req.param('password') + ":@" + req.param('domain');
    for (var i = 0; i < req.param('hits'); i++ ) {
        // The callback function takes 3 parameters, an error, response status code and the html
        request(url, function(error, response, html){
            console.log("awdfasdf");
            // Check to make sure no errors occurred when making the request
            if(error){
                res.write('Something wrong happened after ' + i + ' hits');     
            }
            else {
                console.log("processing request number " + i);
            }
        })
    }
    res.write('Mission Accomplished!');
    res.end();
})

//How to use the command line from the web
expressapp.get('/commandLine', function (req, res) {
    exec('curl https://www.google.com',
        function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        res.send( stdout);
    });
})

//Shows how the __dirname global object works
expressapp.get('/getDir', function(req, res){
    res.send( __dirname );
})

//reads the cookies 
expressapp.get('/getCookies', function(req, res) {
    console.log("All of the Cookies!: ", req.cookies);
    console.log("Just One Cookie!: ", req.cookies.specificCookieNameHere);
    res.send( "All of the Cookies!: " + JSON.stringify(req.cookies));
})

//Sets cookies
expressapp.get('/setCookies', function(req, res) {
    console.log("Baking the Cookies!");
    res.cookie('specificCookieNameHere', 'Fresh Baked Cookies', { path: '/'});
    res.send( "<h1>Cookies have been set</h1>");
})

//deletes cookies
expressapp.get('/unsetCookies', function(req, res) {
    console.log("Throwing away the Cookies!");
    res.clearCookie('specificCookieNameHere', { path: '/'});
    res.send( "Throwing away the Cookies!");
})

//Dynamically string replacement on a file
expressapp.get('/replaceFile', function(req, res) {
    var file = fs.readFileSync('filepath','UTF-8');

    file = file.replace('https://www.google.com/', req.headers.host);
    file = file.replace('http')


    // these are equivalent to res.send()
    res.write(file);
    res.end();
})
//Sets up the listener for the express app
expressapp.listen('8081')

//Splash screen including the Node JS logo ascii art
console.log('................................................................................\n.....................................=====......................................\n..................................===========...................................\n...............................=================................................\n............................===========.===========.............................\n..........................==========.......==========...........................\n.......................===========...........===========........................\n....................===========.................===========.....................\n.................===========.......................===========..................\n...............==========.............................==========................\n............==========...................................==========.............\n.........===========.......................................===========..........\n.......==========.............................................==========........\n......========...................................................========.......\n......=====.........................................................=====.......\n......=====.........................................................=====.......\n......=====..............======........=================............=====.......\n......=====..............======......=====================..........=====.......\n......=====..............======....=========================........=====.......\n......=====..............======....======............=======........=====.......\n......=====..............======...======...............======.......=====.......\n......=====..............======...======................=====.......=====.......\n......=====..............======...========..........................=====.......\n......=====..............======....================.................=====.......\n......=====..............======.....======================..........=====.......\n......=====..............======........=====================........=====.......\n......=====..............======..............================.......=====.......\n......=====..............======........................=======......=====.......\n......=====..............======..======.................======......=====.......\n......=====..............======..======.................======......=====.......\n......=====..............======...======................======......=====.......\n......=====..............======...=========..........========.......=====.......\n......=====..............======.....========================........=====.......\n......=====..............======.......====================..........=====.......\n......=====..............======...........============..............=====.......\n......======.............======.....................................=====.......\n......========...........======..................................========.......\n.......==========........======...............................==========........\n.........===========...=======.............................===========..........\n............==================..........................===========.............\n...............==============.........................==========................\n..................========.........................==========...................\n................................................==========......................\n.............................=====...........===========........................\n...........................==========.....===========...........................\n.............................==========.==========..............................\n................................===============.................................\n...................................==========...................................\n.....................................=====......................................\n................................................................................\n');
console.log('          Node Express Server Demo Platform Started at localhost:8081');

exports = module.exports = expressapp;