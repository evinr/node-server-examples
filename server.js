var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var exec = require('child_process').exec;
var cookieParser = require('cookie-parser');


app.use(express.static('public'));

app.get('/basicGet', function(req, res){
    console.log('Get made...');

    var $ = cheerio.load('<h1> Congratulaitons you won!');
    res.send( $.html());
})
    
app.post('/scrape', function(req, res){
    console.log('Post made...');
    console.log(req);
    // The callback function takes 3 parameters, an error, response status code and the html
    url = 'https://username:password@domain';
    request(url, function(error, response, html){
        // Check to make sure no errors occurred when making the request
        if(!error){
            res.send('The post was successful: ', response);     
        }
        else {
            res.send('The post failed: ', response);
        }
    })
})

app.get('/commandLine', function (req, res) {
     exec('curl https://www.google.com',
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        res.send( stdout);
    });
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;