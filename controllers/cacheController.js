'use strict';
var entries = require('../src/entries');
var fetcher = require('../src/fetcher');

function getUrl(url, callback){
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

module.exports.getUrl = getUrl;
