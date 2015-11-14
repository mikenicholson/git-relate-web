'use strict';

var nodegit = require('nodegit');


function RepoUpdater(repo, authOpts, intervalMinutes) {
    this.repo = repo;
    this.intervalObj = null;
    this.authOpts = authOpts;
    this.upateInterval = intervalMinutes * 1000 * 60;
}


var util = require('util');

RepoUpdater.prototype.start = function () {
    if (this.intervalObj) {
        return;
    }

    var self = this;
    var theRepo = self.repo;
    this.intervalObj =  setInterval(function () {
        var fetchOpts = {};
        fetchOpts.prune = 1;
        fetchOpts.downloadTags = 1;
        fetchOpts.callbacks = {};
        fetchOpts.callbacks.certificateCheck = function () { return 1; };
        var publicKeyPath = self.authOpts.publicKeyPath,
            privateKeyPath = self.authOpts.privateKeyPath,
            keyPassphrase = self.authOpts.passphrase;
        fetchOpts.callbacks.credentials = function (url, userName) {
            return new nodegit.Cred.sshKeyNew(userName, publicKeyPath, privateKeyPath, keyPassphrase);
        };

        theRepo.then(function (r) { 
            r.fetch('origin', fetchOpts).then(function () { 
                console.log("Successfully fetched"); })
            }).catch(function (err) {
                console.log("Failed to update repo: " + err);
            });
    }, 10000);
};



RepoUpdater.prototype.cancel = function () {
    this.intervalObject.cancel();
};



module.exports = RepoUpdater;
