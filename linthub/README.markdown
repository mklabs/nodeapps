# LintHub

This little Node app lets you easily run JSLint on a github repo. It makes use of [node-github](https://github.com/ajaxorg/node-github) to access the Github API, [JSLint](https://github.com/douglascrockford/JSLint) to hurt our feelings and [node.js](https://github.com/ry/node) to serve them together.

Very first workable version.


## Installation

	git clone git://github.com/MkLabs/linthub.git
	cd linthub
	git submodule update --init --recursive
	node server.js

## Usage

Heads up to [localhost:15001](http://localhost:15001/)

Lints are available under /lint/:user/:repo routes. You can run JSlint on a whole repository (request made to the github api are limited though), or restrict with the use of sub path and/or file names.

# Options
JSLint options are in the todo list. Defaults JSLint options are applied.

### Example
#### This repo
* [localhost:15001/lint/mklabs/linthub](http://localhost:15001/lint/mklabs/linthub)
* [localhost:15001/lint/mklabs/linthub/static/js](http://localhost:15001/lint/mklabs/linthub/static/js)
* [localhost:15001/lint/mklabs/linthub/static/js/script.js](http://localhost:15001/lint/mklabs/linthub/js/script.js)

#### jQuery
* [localhost:15001/lint/jquery/jquery](http://localhost:15001/lint/jquery/jquery/)
* [localhost:15001/lint/jquery/jquery/src/](http://localhost:15001/lint/jquery/jquery/src/)


Have fun while exploring github with your new JSLint toy.

## Todo

I kinda like this project. Since I discovered JSLint, I always loved it and tried to [make experiments with it](https://github.com/mklabs/lintswarm).

I like the idea of running JSLint against any given repo. I have several ideas and improvments in mind:

* Design a simple and efficient way of caching github requests based on last commit's repo and sha. No need to re-perform the whole bunch of request for something we might already have.
* I really love the new GitHub [Tree Slider](https://github.com/blog/760-the-tree-slider), techniques used and inspiration really neat. Might think to try to implement a similar components to navigate through a git repo to lint.
* Full support of JSLint options and the ability for the user to change them.
* Allow users to authenticate themselves so as to avoid Github count request limits (Flushed every min, request limit is based on IP when requests are made in unauth'd mode).

I have yet no ideas if this app will remain something I had done in an day or if it is an experiment I want to evolve to something bigger.

# Lint them all!

