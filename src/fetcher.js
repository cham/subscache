'use strict';
var request = require('request').defaults({
    encoding: 'utf8',
    json: true
});
var unresolvedRequests = {};
var statusCodeToErrorStringMap = {
    '401': 'Unauthorised'
};

function getResponseCodeError(errorCode){
    var errorMessage = statusCodeToErrorStringMap[errorCode];

    if(!errorMessage){
        errorMessage = errorCode;
    }

    return new Error('The api responded with "' + errorMessage + '"');
}

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
                if(response.statusCode !== 200){
                    return registeredCallback(getResponseCodeError(response.statusCode));
                }

                registeredCallback(null, data);
            });
            delete unresolvedRequests[url];
        });
    }
}

module.exports.getData = getData;
