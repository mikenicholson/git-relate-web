'use strict';
var nodegit = require('nodegit'),
    q = require('q'),
    util = require('util');

function RepoCloner(url, dataPath, authOpts) {
    this.promise = null;
    this.url = url;
    this.dataPath = dataPath; 
    this.authOpts = authOpts || {};
}


RepoCloner.prototype.repo = function () {
    if ( this.promise ) {
        return this.promise;
    } else { 
        console.log("Attemping to clone repo: " + this.url + " to directory: " + this.dataPath);
        console.log("About to create clone options");        
        var opts = {};
        console.log("The default clone options: \n" + util.inspect(opts));
        opts.bare = 1;
        opts.fetchOpts = {callbacks: {}};
        opts.fetchOpts.callbacks.certificateCheck = function() { return 1; };
        var publicKeyPath = this.authOpts.publicKeyPath,
            privateKeyPath = this.authOpts.privateKeyPath,
            keyPassphrase = this.authOpts.passphrase;
        opts.fetchOpts.callbacks.credentials = function(url, userName) { return new nodegit.Cred.sshKeyNew(userName, publicKeyPath, privateKeyPath, keyPassphrase); };
        var cloneRepo = nodegit.Clone(this.url, this.dataPath, opts)

        cloneRepo.then(function (repo) { console.log("Successfully cloned repo"); });
        var self = this;
        var retryOpenOnError = cloneRepo.catch(function (err) {
            console.log("Error occured when cloning repo: " + err);
            var opened = nodegit.Repository.open(self.dataPath).then(function(repo) { console.log("Successfully opened repo."); }).catch(function(err) { console.log("failed to open: " + err);});
        });
        this.promise = retryOpenOnError;
        return retryOpenOnError;
    }
};


module.exports = RepoCloner;
