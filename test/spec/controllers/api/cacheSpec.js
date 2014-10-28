'use strict';
var sinon = require('sinon');
var sandbox = sinon.sandbox.create();
var cacheApi = require('../../../../controllers/api/cache');
var cacheController = require('../../../../controllers/cacheController');

describe('cache api', function(){
    var cacheItem = {foo: 'bar'};

    afterEach(function(){
        sandbox.restore();
    });

    describe('get', function(){
        var callbackStub;
        var getUrlStub;
        var res;
        var req;

        beforeEach(function(){
            callbackStub = sandbox.stub();
            getUrlStub = sandbox.stub(cacheController, 'getUrl');

            res = {
                send: sandbox.stub()
            };
            res.status = sandbox.stub().returns(res);

            req = {
                url: 'http://beenet.co.uk'
            };

            cacheApi.get(req, res);
        });

        it('calls cacheController.getUrl', function(){
            expect(getUrlStub.calledOnce).toEqual(true);
        });

        it('passes the built url to getUrl', function(){
            expect(getUrlStub.args[0][0]).toEqual('http://api-stage.brandwatch.com' + req.url);
        });

        describe('if getUrl returns an error', function(){
            beforeEach(function(){
                getUrlStub.yield(new Error('argh!'));
            });

            it('sets the response status to 500', function(){
                expect(res.status.calledOnce).toEqual(true);
                expect(res.status.args[0][0]).toEqual(500);
            });

            it('sends the error message with the response', function(){
                expect(res.send.calledOnce).toEqual(true);
                expect(res.send.args[0][0]).toEqual('argh!');
            });
        });

        describe('if getUrl does not return an error', function(){
            beforeEach(function(){
                getUrlStub.yield(null, cacheItem);
            });

            it('sends the cache item with the response', function(){
                expect(res.send.calledOnce).toEqual(true);
                expect(res.send.args[0][0]).toEqual(cacheItem);
            });
        });
    });
});
