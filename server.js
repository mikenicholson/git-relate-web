'use strict';
var express = require('express'),
    bodyparser = require('body-parser'),
    config = require('./config'),
    child_process = require('child_process'),
    util = require('util'),
    morgan = require('morgan'),
    nodegit = require('nodegit'),
    RepoCloner = require('./lib/repocloner.js'),
    PeriodicTask = require('./lib/periodictask.js');

// Clone or open the repository
var repoCloner = new RepoCloner(config.repo_url, config.data_dir, config.authOpts);
var repo = repoCloner.repo();

// If successful start fetching the repo periodicly
var fetcherTask = null;
repo.then(function () {
    fetcherTask = new PeriodicTask(config.fetchIntervalMinutes, function() { 
        repoCloner.fetch();
    });
    fetcherTask.start();
});



var app = express();

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(bodyparser.json());
app.use(morgan('dev'));

app.post('/api/relate', function (req, res) {
    var ancestor = req.body.ancestor;
    var descendant = req.body.descendant;

    var opts = { cwd: config.repo_dir };
    var cmd = util.format("git merge-base --is-ancestor %s %s", ancestor, descendant)
    child_process.exec(cmd, opts, function(err, stdout, stderr) {
        var result; 
        if (err) {
            result = false;
        } else {
            result = true; 
        }

        res.send({result: result}); 
    });

});


app.get('/api/commit/:commit_id', function(req, res) {
    console.log("Looking up data for commit id: " + req.params.commit_id);
    var commit_spec = req.params.commit_id;
    repo.then(function (repo) {
        nodegit.Revparse.single(repo, req.params.commit_id).then(function(object) {
            if (object.type() === nodegit.Object.TYPE.COMMIT) {
                return nodegit.Commit.lookup(repo, object.id());
            } else {
                throw Error(commit_spec + " does not represent a valid git commit");
            }
        }).then(function (commit) {
            console.log(commit.summary());
            var commit_json = {
                author_name: commit.author().name(),
                author_email: commit.author().email(),
                date: commit.date(),
                message: commit.message(),
                id: commit.id().tostrS()
            };
            res.json(commit_json);
        }).catch(function(error){
            res.status(404)
            res.json({error: commit_spec + " does not name a valid git commit."});
        });
    }).catch(function(error) {
        res.status(500)
        res.json({error: error});
    });
});



app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});



var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Is newer app listening at http://%s:%s', host, port);
});
