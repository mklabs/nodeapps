/**
 * This modules provides stuff to run jsLint on a set of js files hoisted on a github repo.
 *
 * Author: mdaniel @mklabs
 */

var GitHubApi = require("github").GitHubApi,
	Markdown = require("markdown").Markdown,
  Prettify = require('./prettify'),
	jslint = require('./jslint');
	
const MAX_SIZE = 50;

var LintHub = module.exports = (function LintHub() {

    var api = new GitHubApi(true),
    objectApi = api.getObjectApi(),
    
    getApi = function getApi() {
      return new GitHubApi(true).getObjectApi();
    },
    
    getRApi = function getRApi() {
      return new GitHubApi(true).getRepoApi();
    },
    
    cache = {},
    
    isEmptyObj = function(a) {
      for (var b in a) { 
        return false; 
      } 
      return true; 
    },
    
    filterResults = function(resp, r, ckey){
      var key, results = {}, o, sha, m = [];
      
      for (key in resp) {
          o = typeof resp[key] === 'string' ? {sha: resp[key], key: key, title: ''} : resp[key];
          
          m = o.key.match(r) || false;
          
          if (m && !/min\.js/.test(m[0])) {
            results[o.sha] = {
              key: o.key,
              title: m[0],
              sha: o.sha
            };
          }
      }
      
      if(ckey) {
        cache[ckey] = {
          blobs: resp,
          results: results
        };
      }
      
      return results;
    };
    
    /**
    * Private helper to remotely get the list of blobs from a given repo.
    */
    getFiles = function listBlobs(user, repo, path, r, next, cb) {
        var self = LintHub,
        
        ckey = user + '/' + repo,
        
        c = cache[ckey],
        
        _cb = cb;
        
        if(self !== LintHub) {
          throw new TypeError;
        }
        
        if(c) {
          return cb.call(self, filterResults(c.blobs, r), c.lmit);
        }
        
        
        getApi().listBlobs(user, repo, 'master', function(err, resp) {
            var name, results = {}, m = [], msg;

            if (err) {
              msg = err.status === 403 ? err.msg.error[0].replace(/ for .+/, '') : err.msg.error;
              console.log(err, msg);
              return next(new Error(err.status + ' - ' + msg));
            }
            
            results = filterResults(resp, r, ckey);
            
            if(isEmptyObj(results) && resp[path]) {
              results[resp[path]] = {
                key: path,
                title: path,
                sha: resp[path]
              };
            }
            
            cb.call(self, results);
        });
    };
    

    return {
      
      lintRepo: function lintRepo(p, next, cb) {
        var self = this,
        user = p.user,
        repo = p.repo,
        path = p.path || '';
        
        
        this.getJsFiles(user, repo, path, next, function(datas, limit){
          var results = [], i, key, data, rl, len = 0, count = 0;
          
          if(isEmptyObj(datas)) {
            return cb.call(self);
          }
          
          for (key in datas) {
            len = len + 1;
          }
          
          for (key in datas) {
            data = datas[key];
            
            self.getData(user, repo, data.sha, next, function(resp) {
              rl = results.push({
                key: key,
                title: data.title,
                url: '/lint/' + user + '/' + repo + '/' + data.key,
                giturl: 'http://github.com/' + user + '/' + repo + '/' + 'tree/master/' + data.key,
                lints: (!jslint(resp)) ? jslint.errors : undefined
              });

              if(len === rl) {
                return cb.call(self, results);
              }
              
              if((count = count + 1) > MAX_SIZE) {
                return cb.call(self, results, MAX_SIZE);
              }
            });
          }
        });
        
      },
      
      getData: function getData(user, repo, sha, next, cb) {
        var self = this, 
        c = cache[user+'/'+repo];
        
        if(c && c.results[sha] && c.results[sha].content) {
          return cb.call(self, c.results[sha].content);
        }
        
        getApi().getRawData(user, repo, sha, function(err, resp) {
          if(c && c.results[sha]) {
            c.results[sha].content = resp;
          }
          
          cb.call(self, resp);
        });
      },
      
      getFiles: function(user, repo, path, next, cb) {
        var r = new RegExp(path + (/\/$/.test(path.replace('/', '\/')) ? '' : '\/') + '.+');
        return getFiles(user, repo, path, r, next, cb);
      },
      
      getJsFiles: function(user, repo, path, next, cb) {
        
        var r = /\.js$/.test(path) ?
          new RegExp(path) : 
          new RegExp(path + (/\/$/.test(path) ? '' : '\/') + '.+\\.js');
        
        return getFiles(user, repo, path, r, next, cb);
      },
      
      showRoot: function(user, repo, next, cb){
        var self = this;
        getRApi().getRepoBranches(user, repo, function(err, resp){
          var sha;
          
          if (err) {
            msg = err.status === 403 ? err.msg.error[0].replace(/ for .+/, '') : err.msg.error;
            console.log(err, msg);
            return next(new Error(err.status + ' - ' + msg));
          }
          
          sha = resp['master'];
          
          getApi().showTree(user, repo, sha, function(errTree, respTree){
            cb.call(this, respTree)
          });
        });
      },
      
      showTree: function(user, repo, sha, next, cb) {
        var self = this;
        
        getApi().showTree(user, repo, sha, function(errTree, respTree){
          console.log(respTree);
          cb.call(this, respTree)
        });
          
      },
      
      showBlob: function(user, repo, path, sha, next, cb) {
        var self = this,
        isBinary = /(\.png|\.gif|\.jpg|\.jpeg|\.jar|\.zip|\.rad)/.test(path);
        
        this.getData(user, repo, sha, next, function(resp) {
          cb.call(self, [{
            key: sha,
            title: path,
            url: '/blob/' + user + '/' + repo + '/' + path + '/' + sha,
            giturl: 'http://github.com/' + user + '/' + repo + '/' + 'tree/master/' + path,
            content: !isBinary ? Prettify.prettyPrintOne(resp) : '',
            contentLength: resp && resp.split(/\n/).length,
            lints: !isBinary ? ((!jslint(resp)) ? jslint.errors : undefined) : undefined
          }]);
        });  
      },
      
      getCache: function(){
        return cache;
      }
    };
})();