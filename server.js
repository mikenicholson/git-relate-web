var express = require('express'),
    bodyparser = require('body-parser'),
    config = require('./config'),
    child_process = require('child_process'),
    util = require('util'),
    morgan = require('morgan');

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyparser.json());
app.use(morgan('dev'))

app.post('/api/isnewer', function (req, res) {
    ancestor = req.body.ancestor;
    descendant = req.body.descendant;

    opts = { cwd: config.repo_dir };
    cmd = util.format("git merge-base --is-ancestor %s %s", ancestor, descendant)
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

app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});


var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Is newer app listening at http://%s:%s', host, port);
});
