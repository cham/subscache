'use strict';
var client = require('redis').createClient();
var allEntriesKey = 'allentries';
var keyHead = 'subscache:item:';
var cacheTime = 5 * 1000;

function retrieveAllUrls(callback){
    client.hgetall(allEntriesKey, function(err, entries){
        if(err){
            return callback(err);
        }
        callback(null, entries);
    });
}

function hasItem(url, callback){
    client.get(keyHead + url, function(err, item){
        callback(err, !!item);
    });
}

function retrieveItem(url, callback){
    client.get(keyHead + url, function(err, item){
        if(err){
            return callback(err);
        }
        try{
            item = JSON.parse(item);
        }catch(e){
            return callback(new Error('could not parse JSON'));
        }
        callback(null, item);
    });
}

function addItem(url, data, callback){
    var multi = client.multi();
    var body = JSON.stringify(data) || '';

    multi.set(keyHead + url, body);
    multi.hset(allEntriesKey, url, Date.now());

    multi.pexpire(keyHead + url, cacheTime);
    multi.exec(callback);
}

module.exports.hasItem = hasItem;
module.exports.retrieveItem = retrieveItem;
module.exports.addItem = addItem;
module.exports.retrieveAllUrls = retrieveAllUrls;
