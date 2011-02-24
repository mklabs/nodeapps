/**
 * This modules provides method to manage github repo, namely to grab information from github.
 *
 * Author: mdaniel @mklabs
 */

var GitHubApi = require("github").GitHubApi,
	Markdown = require("markdown").Markdown,
	config = require('../config');

var Githuber = module.exports = (function Githuber() {

    var inst = new GitHubApi(true),

    // Repo information
    rd = config.data,

    // blobs list cache
    blobs = [],

    // keep reference to repo api
    repo = inst.getRepoApi(),
    // the same for object api
    object = inst.getObjectApi(),

    // Private helper that wraps getRawData call
    getRawData = function getRawData(sha, cb) {
        var self = this;
        object.getRawData(rd.user, rd.repo, sha,
        function(err, resp) {
            cb.call(self, resp);
        });
    };

    return {
        getRepoData: function() {
            return rd;
        },
        listBlobs: function listBlobs(next, cb) {
            var self = this;

            // do we have pre-cached list available
            if (blobs.length) {
                cb.call(self, blobs);
                return;
            }

            object.listBlobs(rd.user, rd.repo, rd.branch, function(err, resp) {
                var name, result = [], m = [];

                if (err) return next(new Error('Error in listing blobs'));


                for (var key in resp) {
                    m = key.match(/([\w|-]+)\.(md|markdown)/) || false;

                    if (m) {
                        result.push({
                            title: m[1],
                            sha: resp[key]
                        });
                    }
                }

                // cache results for next requests
                if (result.length) {
                    blobs = result;
                }

                cb.call(self, result);
            });
        },
        getArticle: function(sha, next, cb) {
            var self = this;
            getRawData(sha, function(data) {
                if (!data) return next(new Error('wrong sha.'));

                var m = data.match(/(title):(\s.+)/);
                cb.call(self, {
                    title: (m && m[2]) ? m[2].trim() : "",
                    content: Markdown(data)
                });
            });
        }
    };
})();