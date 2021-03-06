//setup Dependencies
require(__dirname + "/lib/setup").ext(__dirname + "/lib").ext(__dirname + "/lib/express/support");
var connect = require('connect'), 
	express = require('express'), 
	sys = require('sys'), 
	io = require('Socket.IO-node'), 
	port = 27051,
	analyticsSiteId = 'UA-19669799-1';

//Setup Express
var server = express.createServer();
server.configure(function() {
    server.set('views', __dirname + '/views');
    server.use(connect.bodyDecoder());
    server.use(connect.staticProvider(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next) {
    if (err instanceof NotFound) {
        res.render('404.ejs', {
            locals: {
                header: '#Header#',
                footer: '#Footer#',
                title: '404 - Not Found',
				pageId: '404',
                description: '',
                author: '',
                analyticssiteid: analyticsSiteId
            },
            status: 404
        });
    } else {
        res.render('500.ejs', {
            locals: {
                header: '#Header#',
                footer: '#Footer#',
				pageId: '500',
                title: 'The Server Encountered an Error',
                description: '',
                author: '',
                analyticssiteid: analyticsSiteId,
                error: err
            },
            status: 500
        });
    }
});
server.listen(port);

//Setup Socket.IO
var io = io.listen(server);
io.on('connection', function(client) {
    client.on('message', function(message) {
        client.broadcast(message);
    });
    client.on('disconnect', function() {
        console.log('Client Disconnected.');
    });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req, res) {
	
    res.render('index.ejs', {
        locals: {
            title: 'Harmony IO: Nothing more than a geek pretext to play with Node.js, Socket.IO & Harmony',
			pageId: 'index',
            description: 'Page Description',
            author: 'Your Name',
            analyticssiteid: analyticsSiteId
        }
    });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res) {
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res) {
    throw new NotFound;
});

function NotFound(msg) {
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port);
