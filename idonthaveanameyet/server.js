//setup Dependencies
require(__dirname + "/lib/setup").ext( __dirname + "/lib").ext( __dirname + "/lib/express/support");
var connect = require('connect'), 
	express = require('express'), 
	sys = require('sys'), 
//	GitHubApi = require("github").GitHubApi,
	githuber = require('githuber'),
	title = "['Node', 'Express', 'Github API', 'Twitter like UI'].join(' + ') === this",
	port = 15001;

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.use(connect.methodOverride());
    server.use(connect.bodyDecoder());
    server.use(connect.staticProvider(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next) {
	
		var r = githuber.getRepoData();
	
    if (err instanceof NotFound) {
        res.render('404.ejs', {
            locals: {
                header: '404 - Not found',
                title: title,
                description: ['404 - Not found', r.user, r.repo, r.branch],
                author: 'You!',
                analyticssiteid: 'XXXXXXX'
            },
            status: 404
        });
    } else {
        res.render('500.ejs', {
            locals: {
                header: 'The Server Encountered an Error',
                title: title,
                description: ['The Server Encountered an Error', r.user, r.repo, r.branch],
                author: 'You!',
                analyticssiteid: 'XXXXXXX',
                error: err
            },
            status: 500
        });
    }
});
server.listen(port);

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  ////////

server.get('/', function(req, res, next) {
	githuber.listBlobs(next, function(data) {
		
		var r = this.getRepoData(),
		desc = 'Basic list of markdown files in the configured repository ';
		
		res.render('list.ejs', {
			locals: {
				header: '/\\.(md|markdown)/.test(path)',
				title: title,
				description: [desc, r.user, r.repo, r.branch],
				author: 'Me!',
				analyticssiteid: 'XXXXXXX',
				list: data
			}
		});

	});
});

server.get('/article/:sha', function(req,res, next){
	githuber.getArticle(req.params.sha, next, function(data){
		res.render('article.ejs', {
			layout: false,
			locals : { 
				title: data.title,
				content: data.content
			}
		});
	});
});

//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
