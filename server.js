var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var expressapp     = express();
var bodyParser = require('body-parser');
var exec = require('child_process').exec;
var cookieParser = require('cookie-parser');
var Firebase = require('firebase');

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

//Uses promises to asyncronously scrap a years worth of results from a page
expressapp.get('/', function(req, res){
   
var a = moment('2016-01-01');
var b = moment('2017-01-01');
var allHolidays = {}

// pure function ;-)
var makeUrl = function(momentDate) {
    var date = momentDate.format('MM/DD/YYYY')
        return {
            url: "https://www.checkiday.com/" + date,
            date: date
        };
};

var makeRequestPromise = function(url, date) {
    return new Promise(function(resolve, reject) {
        request(url, function(error, response, html){
            if(error){
                return reject(error);     
            }


            var $ = cheerio.load(html);

            var name, source;
            var json = { name : "", source : ""};
            var holidays = [];

            $('#middle_content').each(function(){
                var data = $(this);
                var total = data.children('2').children()._root['0'].children[4].next.children.length - 4;
                var parseMe = data.children('2').children()._root['0'].children[4].next.children;

                for (i =1; i <= total; i += 2) {

                    name = parseMe[i].children[1].children[1].attribs.title.toString();
                    source = parseMe[i].children[1].children[1].attribs.href.toString();
                    console.log(name)
                    var nameRegex = /is\s\"?(.*)\"?!/g;
                    json.name = name.length > 19 ? nameRegex.exec(name)[1] : null;
                    json.source = source;

                    holidays.push(json)
                    json = { name : "", source : ""};
                }

                
            });
            
              allHolidays[date] = holidays; //m.format('MM-DD-YYYY')
                var file = fs.readFileSync('output.json', 'utf8');
                var dataToWrite = JSON.stringify(allHolidays, null, 4);
                fs.writeFileSync('output.json', dataToWrite, 'utf8');
              // finish promise
          resolve('File write successfull ' + url);
        });
    });
};

var promises = [];

for (var m = a; m.isBefore(b); m.add( 1, 'days')) {
    var mUrlObject = makeUrl(m)
    promises.push(
        makeRequestPromise( mUrlObject.url, mUrlObject.date )
    ); 
}

Promise.all(promises)
  .catch(function(err){ return console.error('Error in Promises.all()',err); })
  .then(function(msg) {
        // ^^ 'msg' param is an array of returned values
    console.log(msg); // array of resolve(msg) from above..
  });

    //res.write('Mission Accomplished!');
    res.end();
})


//Dynamic file system management
expressapp.get('/list', function(req, res) { //returns a list of app pages
    //lists the apps via the folder structure
    var list;
    var getApps = function () { 
        return new Promise(function(resolve, reject) { 
            
            exec('for i in $(ls ./public/apps); do echo ${i%%/}; done',
                function (error, stdout, stderr) {
                    list = stdout.split('\n');
                    list.pop() // removes the last element, which is empty
                    
                    console.log(list);
                    // return list;
                    
                    // res.send(list);
            });
            resolve(list);
        });
    }

    Promise.all([getApps(), getApps()])
    .catch(function(err){ return console.error('Error in Promises.all()',err); })
    .then(function(msg) {
        // ^^ 'msg' param is an array of returned values from within the resolve above
        console.log(msg); // array of resolve(msg) from above..
        res.send(JSON.stringify(msg))
        
    });


    //lists the config values for each app

    //take object with apps, names, and keys

    //render the UI dynamically

})

expressapp.get('/copy', function(req, res) {
    //var arg = req.param('username'); //maps to the 'name' field on the input
    var target = 'app1';//needs to be read via the req
    var command = 'cp -r ./public/apps/' + target + ' ./public/apps/' + target + '-clone';

    //returns a list of app pages
    exec(command,
        function (error, stdout, stderr) {
            // var list = stdout.split('\n');
            res.send('successful');
    });
})

//rename
expressapp.get('/rename', function(req, res) {
    //var arg = req.param('username'); //maps to the 'name' field on the input
    var target = 'app1';//these values need to be from the req
    var newName = 'app5';
    var command = 'mv ./public/apps/' + target + ' ./public/apps/' + newName;
    exec(command,
        function (error, stdout, stderr) {
            res.send('successful');
    });
})

//firebase demo

expressapp.get('/fireset', function(req, res) {
    var dataRef = new Firebase('https://testmcdemo.firebaseio.com/');
    dataRef.set({"stuff":{"junk":"hello world!","more":"asdfasdfasdf"}});
    //send confirmation it was set
    res.send('data was set!');
})

expressapp.get('/fireget', function(req, res) {
        var dataRef = new Firebase('https://testmcdemo.firebaseio.com/');
    dataRef.child("stuff/more").on("value", function(snapshot) {
        //          ^^^ path to the data
  res.send(snapshot.val());  // Alerts "San Francisco"
});
})


// Parameterized Parsing of the path
expressapp.get('/specific-path/:pathVar1', function(req, res) {
    console.log(req.params.pathVar1)
    res.send('The specific-path parameter was: ' + req.params.pathVar1);
})

// dynamic require promise
expressapp.get('/package-json', function (req, res) {
    res.json(require("./package.json")).end();
});

// Sometimes you need to redirect traffic. Use the status code appropriatly
expressapp.get('/re/:direct', function (req, res) {
  res.redirect(302, '/re/' + req.params.direct + '/');
})

//Sets up the listener for the express appju
expressapp.listen('8081')

// Show all of the paths for the two different ways of having routes in Node/Express
    // Applications - built with express()
    console.log(expressapp.stack)

    //Routers - built with express.Router()
    console.log(expressapp._router.stack)

//Splash screen including the Node JS logo ascii art
console.log('................................................................................\n.....................................=====......................................\n..................................===========...................................\n...............................=================................................\n............................===========.===========.............................\n..........................==========.......==========...........................\n.......................===========...........===========........................\n....................===========.................===========.....................\n.................===========.......................===========..................\n...............==========.............................==========................\n............==========...................................==========.............\n.........===========.......................................===========..........\n.......==========.............................................==========........\n......========...................................................========.......\n......=====.........................................................=====.......\n......=====.........................................................=====.......\n......=====..............======........=================............=====.......\n......=====..............======......=====================..........=====.......\n......=====..............======....=========================........=====.......\n......=====..............======....======............=======........=====.......\n......=====..............======...======...............======.......=====.......\n......=====..............======...======................=====.......=====.......\n......=====..............======...========..........................=====.......\n......=====..............======....================.................=====.......\n......=====..............======.....======================..........=====.......\n......=====..............======........=====================........=====.......\n......=====..............======..............================.......=====.......\n......=====..............======........................=======......=====.......\n......=====..............======..======.................======......=====.......\n......=====..............======..======.................======......=====.......\n......=====..............======...======................======......=====.......\n......=====..............======...=========..........========.......=====.......\n......=====..............======.....========================........=====.......\n......=====..............======.......====================..........=====.......\n......=====..............======...........============..............=====.......\n......======.............======.....................................=====.......\n......========...........======..................................========.......\n.......==========........======...............................==========........\n.........===========...=======.............................===========..........\n............==================..........................===========.............\n...............==============.........................==========................\n..................========.........................==========...................\n................................................==========......................\n.............................=====...........===========........................\n...........................==========.....===========...........................\n.............................==========.==========..............................\n................................===============.................................\n...................................==========...................................\n.....................................=====......................................\n................................................................................\n');
console.log('          Node Express Server Demo Platform Started at localhost:8081');

exports = module.exports = expressapp;