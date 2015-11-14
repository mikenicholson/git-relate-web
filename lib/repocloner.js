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
        var opts = {};
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
            var opened = nodegit.Repository.open(self.dataPath);
            opened.then(function(repo) { console.log("Successfully opened repo."); }).catch(function(err) { console.log("failed to open: " + err);});
            return opened;
        });
        this.promise = retryOpenOnError;
        return retryOpenOnError;
    }
};



module.exports = RepoCloner;
