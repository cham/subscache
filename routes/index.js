'use strict';
var cacheApi = require('../controllers/api/cache');

module.exports = function(router){
    router.get('/*', cacheApi.get);
};
