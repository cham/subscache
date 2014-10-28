'use strict';
var sinon = require('sinon');
var sandbox = sinon.sandbox.create();
var cache = require('../../../controllers/cache');
var entries = require('../../../src/entries');
var fetcher = require('../../../src/fetcher');

describe('cache controller', function(){
    var cacheItem = {foo: 'bar'};

    afterEach(function(){
        sandbox.restore();
    });

    describe('get', function(){
        var callbackStub;
        var hasItemStub;
        var res;
        var req;

        beforeEach(function(){
            callbackStub = sandbox.stub();
            hasItemStub = sandbox.stub(entries, 'hasItem');

            res = {
                send: sandbox.stub()
            };
            res.status = sandbox.stub().returns(res);

            req = {
                url: 'http://beenet.co.uk'
            };

            cache.get(req, res);
        });

        it('checks to see if the item is in the cache with a call to entries.hasItem', function(){
            expect(hasItemStub.calledOnce).toEqual(true);
        });

        describe('if hasItem returns an error', function(){
            beforeEach(function(){
                hasItemStub.yield(new Error('argh!'));
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

        describe('if the item is in the cache', function(){
            var retrieveItemStub;

            beforeEach(function(){
                retrieveItemStub = sandbox.stub(entries, 'retrieveItem');
                
                hasItemStub.yield(null, true);
            });

            it('retrieves the item via entries.retrieveItem', function(){
                expect(retrieveItemStub.calledOnce).toEqual(true);
            });

            describe('if retrieveItem returns an error', function(){
                beforeEach(function(){
                    retrieveItemStub.yield(new Error('an incident has occurred'));
                });

                it('sets the response status to 500', function(){
                    expect(res.status.calledOnce).toEqual(true);
                    expect(res.status.args[0][0]).toEqual(500);
                });

                it('sends the error message with the response', function(){
                    expect(res.send.calledOnce).toEqual(true);
                    expect(res.send.args[0][0]).toEqual('an incident has occurred');
                });
            });

            describe('if retrieveItem does not return an error', function(){
                beforeEach(function(){
                    retrieveItemStub.yield(null, cacheItem);
                });

                it('sends the cache item with the response', function(){
                    expect(res.send.calledOnce).toEqual(true);
                    expect(res.send.args[0][0]).toEqual(cacheItem);
                });
            });
        });

        describe('if the item is not in the cache', function(){
            var getDataStub;

            beforeEach(function(){
                getDataStub = sandbox.stub(fetcher, 'getData');

                hasItemStub.yield(null, false);
            });

            it('fetches the URL via fetcher.getData', function(){
                expect(getDataStub.calledOnce).toEqual(true);
            });

            describe('if getData returns an error', function(){
                beforeEach(function(){
                    getDataStub.yield(new Error('curses'));
                });

                it('sets the response status to 500', function(){
                    expect(res.status.calledOnce).toEqual(true);
                    expect(res.status.args[0][0]).toEqual(500);
                });

                it('sends the error message with the response', function(){
                    expect(res.send.calledOnce).toEqual(true);
                    expect(res.send.args[0][0]).toEqual('curses');
                });
            });

            describe('if getData does not return an error', function(){
                var addItemStub;

                beforeEach(function(){
                    addItemStub = sandbox.stub(entries, 'addItem');

                    getDataStub.yield(null, cacheItem);
                });

                it('adds the data to the cache via entries.addItem', function(){
                    expect(addItemStub.calledOnce).toEqual(true);
                });

                describe('when addItem resolves', function(){
                    describe('if there is an error', function(){
                        beforeEach(function(){
                            addItemStub.yield(new Error('argh!'));
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

                    describe('if there are no errors', function(){
                        beforeEach(function(){
                            addItemStub.yield(null, cacheItem);
                        });

                        it('sends the data with the response', function(){
                            expect(res.send.calledOnce).toEqual(true);
                            expect(res.send.args[0][0]).toEqual(cacheItem);
                        });
                    });
                });
            });
        });
    });
});
