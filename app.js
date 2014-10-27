'use strict';
var cluster = require('cluster');
var client = require('redis').createClient();

client.set('redis-connection-test', 'ok', function(err){
    var cpuCount = 0;
    var worker;

    if(err){
        return console.log(err);
    }

    cpuCount = require('os').cpus().length;

    cluster.setupMaster({
        exec : 'worker.js'
    });

    for(var i = 0; i < cpuCount; i += 1){
        worker = cluster.fork();
    }

    cluster.on('exit', function(worker){
        console.log('Worker ' + worker.id + ' died');
        cluster.fork();
    });

    console.log('Master process started');
});
