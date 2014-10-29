'use strict';
var entries = require('../src/entries');
var fetcher = require('../src/fetcher');
var bypass = require('../src/bypass');

function getUrlWithoutCache(url, callback){
    fetcher.getData(url, function(err, data){
        if(err){
            return callback(err);
        }

        callback(null, data);
    });
}

function getUrlWithCache(url, callback){
    entries.hasItem(url, function(err, hasItem){
        if(err){
            return callback(err);
        }
        if(hasItem){
            return entries.retrieveItem(url, function(err, data){
                if(err){
                    return callback(err);
                }
                return callback(null, data);
            });
        }
        fetcher.getData(url, function(err, data){
            if(err){
                return callback(err);
            }
            entries.addItem(url, data, function(err){
                if(err){
                    return callback(err);
                }

                callback(null, data);
            });
        });
    });
}

function getUrl(url, callback){
    if(bypass.skipCache(url)){
        return getUrlWithoutCache(url, callback);
    }
    getUrlWithCache(url, callback);
}

module.exports.getUrl = getUrl;
