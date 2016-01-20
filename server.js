var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var exec = require('child_process').exec,
child;



app.use(express.static('public'));

app.get('/scrape', function(req, res){
    console.log('Get made...');

    var $ = cheerio.load('<h1 class="title">Do a post instead!/h1>');
    res.send( $.html());
})
    
app.post('/scrape', function(req, res){
    console.log('Post made...');
    console.log(req);
    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html
    url = 'https://username:password@domain';
    request(url, function(error, response, html){
        
        // Check to make sure no errors occurred when making the request
        if(!error){

            res.send('checked');
           
        }
        else {
            //trigger error message on page
            res.send('failed');
        }
    })
})

app.get('/command', function (req, res) {
     exec('curl https://google.com',
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        res.send( stdout);
    });
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;