'use strict';

var nodegit = require('nodegit');


function PeriodicTask(intervalMinutes, taskFunction) {
    this.intervalObj = null;
    this.updateInterval = intervalMinutes * 1000 * 60;
    this.taskFunction = taskFunction;
}



PeriodicTask.prototype.start = function () {
    if (this.intervalObj) {
        return;
    } else {
        this.intevalObj = setInterval(this.taskFunction, this.updateInterval);
    }
};



PeriodicTask.prototype.cancel = function () {
    this.intervalObject.cancel();
};



module.exports = PeriodicTask;
