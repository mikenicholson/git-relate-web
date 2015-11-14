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
    if (!this.promise) {
        var self = this;
        this.promise = self.clone().catch(function () {
            return self.open();
        });
    }
    return this.promise;
};



RepoCloner.prototype.clone = function () {
    var opts = this.getCloneOpts();
    return nodegit.Clone(this.url, this.dataPath, opts);
};



RepoCloner.prototype.open = function () {
    return nodegit.Repository.open(this.dataPath);
};



RepoCloner.prototype.fetch = function () {
    var fetchOpts = this.getFetchOpts();
    this.repo().then(function (r) {
        r.fetch('origin', fetchOpts).then(function () {
            console.log("Successfully fetched");
        });
    }).catch(function (err) {
        console.log("Failed to update repo: " + err);
    });
};



RepoCloner.prototype.getCloneOpts = function () {
    var opts = {
        bare: 1,
        fetchOpts: this.getFetchOpts(),
    };
    return opts;
};



RepoCloner.prototype.getFetchOpts = function () {
    var fetchOpts = {};
    fetchOpts.prune = 1;
    fetchOpts.downloadTags = 1;
    fetchOpts.callbacks = {};
    fetchOpts.callbacks.certificateCheck = this.getCertificateCheckCallback();
    fetchOpts.callbacks.credentials = this.getAuthCallback();

    return fetchOpts;
};



RepoCloner.prototype.getAuthCallback = function () {
    var self = this;
    return function (url, userName) {
        var publicKeyPath = self.authOpts.publicKeyPath,
            privateKeyPath = self.authOpts.privateKeyPath,
            keyPassphrase = self.authOpts.passphrase;
        return new nodegit.Cred.sshKeyNew(userName, publicKeyPath, privateKeyPath, keyPassphrase);
    };
};



RepoCloner.prototype.getCertificateCheckCallback = function () {
    return function () { return 1; };
};



module.exports = RepoCloner;
