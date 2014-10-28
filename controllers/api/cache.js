'use strict';
var cacheController = require('../cacheController');

function sendError(res, err){
    res.status(500).send(err.message);
}

function get(req, res){
    var url = 'http://api-stage.brandwatch.com' + req.url;

    cacheController.getUrl(url, function(err, data){
        if(err){
            return sendError(res, err);
        }
        res.send(data);
    });
}

module.exports.get = get;
