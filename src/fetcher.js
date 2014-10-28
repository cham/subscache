'use strict';
var request = require('request').defaults({
    encoding: 'utf8',
    json: true
});
var unresolvedRequests = {};

function registerRequestCallback(url, callback){
    if(!unresolvedRequests[url]){
        unresolvedRequests[url] = [];
    }

    unresolvedRequests[url].push(callback);
}

function numPendingRequests(url){
    return unresolvedRequests[url].length;
}

function getData(url, callback){
    var options = {
        uri: url,
        method: 'get'
    };

    registerRequestCallback(url, callback);

    if(numPendingRequests(url) === 1){
        request(options, function(err, response, data){
            unresolvedRequests[url].forEach(function(registeredCallback){
                if(err){
                    return registeredCallback(err);
                }

                registeredCallback(null, data);
            });
            delete unresolvedRequests[url];
        });
    }
}

module.exports.getData = getData;
