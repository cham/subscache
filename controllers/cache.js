'use strict';
var entries = require('../src/entries');
var fetcher = require('../src/fetcher');

function sendError(res, err){
    res.status(500).send(err.message);
}

function get(req, res){
    var url = 'http://newapi-stage.brandwatch.com' + req.url;

    entries.hasItem(url, function(err, hasItem){
        if(err){
            return sendError(res, err);
        }
        if(hasItem){
            return entries.retrieveItem(url, function(err, data){
                if(err){
                    return sendError(res, err);
                }
                res.send(data);
            });
        }
        fetcher.getData(url, function(err, data){
            if(err){
                return sendError(res, err);
            }
            entries.addItem(url, data, function(err){
                if(err){
                    return sendError(res, err);
                }
                
                res.send(data);
            });
        });
    });
}

module.exports.get = get;
