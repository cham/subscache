'use strict';
var sinon = require('sinon');
var sandbox = sinon.sandbox.create();
var cacheController = require('../../../controllers/cacheController');
var entries = require('../../../src/entries');
var fetcher = require('../../../src/fetcher');

describe('cacheController', function(){
    var cacheItem = {foo: 'bar'};
    var testUrl ='http://beenet.co.uk';

    afterEach(function(){
        sandbox.restore();
    });

    describe('getUrl', function(){
        var callbackStub;
        var hasItemStub;

        beforeEach(function(){
            callbackStub = sandbox.stub();
            hasItemStub = sandbox.stub(entries, 'hasItem');

            cacheController.getUrl(testUrl, callbackStub);
        });

        it('checks to see if the item is in the cache with a call to entries.hasItem', function(){
            expect(hasItemStub.calledOnce).toEqual(true);
        });

        describe('if hasItem returns an error', function(){
            beforeEach(function(){
                hasItemStub.yield(new Error('argh!'));
            });

            it('executes the callback, passing the error', function(){
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
                expect(callbackStub.args[0][0].message).toEqual('argh!');
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

                it('executes the callback, passing the error', function(){
                    expect(callbackStub.calledOnce).toEqual(true);
                    expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
                    expect(callbackStub.args[0][0].message).toEqual('an incident has occurred');
                });
            });

            describe('if retrieveItem does not return an error', function(){
                beforeEach(function(){
                    retrieveItemStub.yield(null, cacheItem);
                });

                it('executes the callback, passing no errors and the cache item', function(){
                    expect(callbackStub.calledOnce).toEqual(true);
                    expect(callbackStub.args[0][0]).toEqual(null);
                    expect(callbackStub.args[0][1]).toEqual(cacheItem);
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

                it('executes the callback, passing the error', function(){
                    expect(callbackStub.calledOnce).toEqual(true);
                    expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
                    expect(callbackStub.args[0][0].message).toEqual('curses');
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

                        it('executes the callback, passing the error', function(){
                            expect(callbackStub.calledOnce).toEqual(true);
                            expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
                            expect(callbackStub.args[0][0].message).toEqual('argh!');
                        });
                    });

                    describe('if there are no errors', function(){
                        beforeEach(function(){
                            addItemStub.yield(null, cacheItem);
                        });

                        it('executes the callback, passing no errors and the cache item', function(){
                            expect(callbackStub.calledOnce).toEqual(true);
                            expect(callbackStub.args[0][0]).toEqual(null);
                            expect(callbackStub.args[0][1]).toEqual(cacheItem);
                        });
                    });
                });
            });
        });
    });
});
