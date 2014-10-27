'use strict';
var cacheController = require('../controllers/cache');

module.exports = function(router){
    router.get('/*', cacheController.get);
};
