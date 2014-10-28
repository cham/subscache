'use strict';
var express = require('express');
var sinon = require('sinon');
var sandbox = sinon.sandbox.create();
var indexRoute = require('../../../routes/index');
var cacheApi = require('../../../controllers/api/cache');
var server = require('../../../server');

describe('index route', function(){
    var serverInstance;
    var cacheGetStub;
    var router;

    beforeEach(function(){
        cacheGetStub = sandbox.stub(cacheApi, 'get');
        router = new express.Router();
        serverInstance = server.listen();
    });

    afterEach(function(){
        serverInstance.close();
        sandbox.restore();
    });

    it('calls get on the cacheApi, passing req and res', function(){
        var req = {
                method: 'get',
                url: '/anything'
            },
            res = {};

        indexRoute(router);
        router(req, res);

        expect(cacheGetStub.calledOnce).toEqual(true);
        expect(cacheGetStub.args[0][0]).toEqual(req);
        expect(cacheGetStub.args[0][1]).toEqual(res);
    });
});
