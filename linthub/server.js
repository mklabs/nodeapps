//setup Dependencies
require(__dirname + "/lib/setup").ext( __dirname + "/lib").ext( __dirname + "/lib/express/support");
var connect = require('connect'), 
	express = require('express'), 
	sys = require('sys'),
	lint = require('linthub'),
	version = '0.1'
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
	
    if (err instanceof NotFound) {
        res.render('404.ejs', {
            locals: {
                header: '404 - Not found',
                title: '404 - Not found',
                author: 'You!',
                analyticssiteid: 'XXXXXXX'
            },
            status: 404
        });
    } else {
        res.render('500.ejs', {
            locals: {
                header: 'The Server Encountered an Error',
                title: 'The Server Encountered an Error',
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

server.get('/', function(req, res, next){
  res.render('index.ejs', {
		locals: {
			header: 'LintHub',
			title: '',
			author: 'Me!',
			analyticssiteid: 'XXXXXXX'
		}
	});
});

/* Tree Routes **/
// server.get('/tree/:user/:repo/:sha', function(req, res, next){
server.get(/\/tree\/([\w_-]+)\/([\w_-]+)\/([\w\/\._-]+)\/([\w]+)/, function(req, res, next){
  var user = req.params[0]
  repo = req.params[1],
  path = req.params[2],
  sha = req.params[3],
  desc = user + '/' + repo + '/' + path; 
  
  lint.showTree(user, repo, sha, next, function(results, limit){    
    if(!results) return next();
    
    res.render('tree/tree.ejs', {
			locals: {
				header: user + '/' + repo,
				title: user + '/' + repo,
				author: 'Me!',
				analyticssiteid: 'XXXXXXX',
        limit: limit || false,
        path: desc,
        breadcrumb: '/tree/' + user + '/' + repo + '/' + sha,
        sha: sha || '',
				files: results
			}
		});
  });
});

server.get(/\/blob\/([\w_-]+)\/([\w_-]+)\/([\w\/\._-]+)\/([\w]+)/, function(req, res, next) {
  var user = req.params[0]
  repo = req.params[1],
  path = req.params[2],
  sha = req.params[3],
  desc = user + '/' + repo + '/' + path; 
  
  lint.showBlob(user, repo, path, sha, next, function(results, limit){    
    if(!results) return next();
    
    res.render('tree/file.ejs', {
			locals: {
				header: user + '/' + repo,
				title: user + '/' + repo,
				author: 'Me!',
				analyticssiteid: 'XXXXXXX',
        limit: limit || false,
        path: desc,
        breadcrumb: '/blob/' + desc + '/' + sha,
        sha: sha,
				lints: results
			}
		});
  });
});


server.get('/tree/:user/:repo', function(req, res, next) {
  var user = req.params.user
  repo = req.params.repo,
  desc = user + '/' + repo;
  
  lint.showRoot(user, repo, next, function(results, limit){    
    if(!results) return next();  
    
    res.render('tree/tree.ejs', {
			locals: {
				header: desc,
				title: desc,
				author: 'Me!',
				analyticssiteid: 'XXXXXXX',
        limit: limit || false,
        path: desc,
        breadcrumb: '/tree/' + desc,
        sha: '',
				files: results
			}
		});
  });
});


/* Lint Routes */
server.get(/\/lint\/([\w_-]+)\/([\w_-]+)\/([\w\/\._-]+)/, function(req, res, next) {
  var p = req.params;
  
  lint.lintRepo({user: p[0], repo: p[1], path: p[2]}, next, function(results, limit) {
    var desc = p.join('/');
    
    if(!results) return next();
    
    
    res.render('lint/lints.ejs', {
			locals: {
				header: 'Lints ' + desc,
				title: 'Lints ' + desc,
				author: 'Me!',
				analyticssiteid: 'XXXXXXX',
        limit: limit || false,
        path: desc,
        sha: '',
				lints: results
			}
		});
  });
});

server.get('/lint/:user/:repo', function(req, res, next) {
  var p = req.params;
  lint.lintRepo(p, next, function(results, limit) {
    
    var desc = p.user + '/' + p.repo;
    
    res.render('lint/lints.ejs', {
			locals: {
				header: 'Lints ' + desc,
				title: 'Lints ' + desc,
				author: 'Me!',
				analyticssiteid: 'XXXXXXX',
				limit: limit || false,
				path: desc,
        sha: '',
				lints: results
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
