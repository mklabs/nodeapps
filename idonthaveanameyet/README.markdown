['Node', 'Express', 'Github API', 'Twitter like UI'].join(' + ') === this
-----------------

Yet another project that doesn't have a name yet.

Tiny experiment using Node & Github Api to get markdown formated data from a github repo.

*(README and all other files with .md / .markdown extension )*

Installation
------------
------------

	git clone git://github.com/MkLabs/idonthaveanameyet.git iwantarealprojectname
	cd iwantarealprojectname
	git submodule update --init --recursive
	node server.js

Edit the config.js file to change repository information
	
	/**
	* Tiny configuration module.
	*
	*	There, you can change repository information used to request Github API.
	*		
	*		user: github user account
	*		repo: repository name to check out
	* 	branch: branch name
	*/
	var config = module.exports = {};

	config.data = {
	    user: "ry",
	    repo: 'node',
	    branch: 'master'
	};

Example
-------
-------
Using npm/isaacs (cause nmp is great)

![sample](https://github.com/MkLabs/idonthaveanameyet/raw/master/static/img/node-md-githubapi-sample.png "sample")