'use strict';

var blacklisted = [
    new RegExp(/\/favicon\.ico$/),
    new RegExp(/\/commandcenter\//)
];

function skipCache(url){
    return blacklisted.some(function(reg){
        return url.match(reg);
    });
}

module.exports.skipCache = skipCache;
