'use strict';
var cluster = require('cluster');
var server = require('./server').listen(process.env.PORT || 3030, function(){
    console.log('Worker listening on port ' + server.address().port);
});
