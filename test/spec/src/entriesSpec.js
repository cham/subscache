'use strict';
var SandboxedModule = require('sandboxed-module');
var sinon = require('sinon');
var sandbox = sinon.sandbox.create();
var entries;

describe('entries', function(){
    var testUrl = 'http://beedogs.com/feed.json';
    var testData = {dogType: 'bee'};
    var multiStub;
    var redisStub;
    var callbackStub;

    beforeEach(function(){
        multiStub = {
            set: sandbox.stub(),
            hset: sandbox.stub(),
            pexpire: sandbox.stub(),
            exec: sandbox.stub()
        };

        redisStub = {
            hgetall: sandbox.stub(),
            get: sandbox.stub(),
            multi: sandbox.stub().returns(multiStub)
        };

        callbackStub = sandbox.stub();

        entries = SandboxedModule.require('../../../src/entries', {
            requires: {
                'redis': {
                    createClient: sandbox.stub().returns(redisStub)
                }
            }
        });
    });

    afterEach(function(){
        sandbox.restore();
    });

    describe('hasItem', function(){
        beforeEach(function(){
            entries.hasItem(testUrl, callbackStub);
        });

        it('calls redis client.get, passing the key for the given url', function(){
            expect(redisStub.get.calledOnce).toEqual(true);
        });

        describe('if there is an error', function(){
            beforeEach(function(){
                redisStub.get.yield(new Error('whoopsie'));
            });

            it('executes the callback, passing the error', function(){
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
                expect(callbackStub.args[0][0].message).toEqual('whoopsie');
            });
        });

        describe('if a matching entry is found', function(){
            beforeEach(function(){
                redisStub.get.yield(null, testData);
            });

            it('executes the callback, passing no errors and true as the value', function(){
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][0]).toEqual(null);
                expect(callbackStub.args[0][1]).toEqual(true);
            });
        });

        describe('if no matching entry is found', function(){
            beforeEach(function(){
                redisStub.get.yield(null, null);
            });

            it('executes the callback, passing no errors and false as the value', function(){
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][0]).toEqual(null);
                expect(callbackStub.args[0][1]).toEqual(false);
            });
        });
    });

    describe('retrieveItem', function(){
        beforeEach(function(){
            entries.retrieveItem(testUrl, callbackStub);
        });

        it('calls redis.get in order to retrieve the item', function(){
            expect(redisStub.get.calledOnce).toEqual(true);
        });

        describe('if there is an error', function(){
            beforeEach(function(){
                redisStub.get.yield(new Error('oh noes'));
            });

            it('executes the callback, passing the error', function(){
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
                expect(callbackStub.args[0][0].message).toEqual('oh noes');
            });
        });

        describe('if the item is found', function(){
            describe('if the item cannot be parsed as JSON', function(){
                beforeEach(function(){
                    redisStub.get.yield(null, '<p>Lol this is HTML!!!11one</p>');
                });

                it('executes the callback, passing the "could not parse JSON" Error', function(){
                    expect(callbackStub.calledOnce).toEqual(true);
                    expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
                    expect(callbackStub.args[0][0].message).toEqual('could not parse JSON');
                });
            });

            describe('if the item can be parsed as JSON', function(){
                beforeEach(function(){
                    redisStub.get.yield(null, JSON.stringify(testData));
                });

                it('executes the callback, passing no errors and the parsed item', function(){
                    expect(callbackStub.calledOnce).toEqual(true);
                    expect(callbackStub.args[0][0]).toEqual(null);
                    expect(typeof callbackStub.args[0][1]).toEqual('object');
                    expect(Object.keys(callbackStub.args[0][1])).toEqual(['dogType']);
                    expect(callbackStub.args[0][1].dogType).toEqual('bee');
                });
            });
        });
    });

    describe('addItem', function(){
        beforeEach(function(){
            entries.addItem(testUrl, testData, callbackStub);
        });

        it('creates a new multi client', function(){
            expect(redisStub.multi.calledOnce).toEqual(true);
        });

        it('sets the cache item with multi.set', function(){
            expect(multiStub.set.calledOnce).toEqual(true);
        });

        it('updates the cache index with multi.hset', function(){
            expect(multiStub.hset.calledOnce).toEqual(true);
        });

        it('sets the expiry time of the cache item with pexpire', function(){
            expect(multiStub.pexpire.calledOnce).toEqual(true);
        });

        it('executes the tasks with multi.exec', function(){
            expect(multiStub.exec.calledOnce).toEqual(true);
        });

        describe('when exec completes', function(){
            describe('if there is an error', function(){
                beforeEach(function(){
                    multiStub.exec.yield(new Error('derp de derp derp'));
                });

                it('executes the callback, passing the error', function(){
                    expect(callbackStub.calledOnce).toEqual(true);
                    expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
                    expect(callbackStub.args[0][0].message).toEqual('derp de derp derp');
                });
            });

            describe('if there are no errors', function(){
                beforeEach(function(){
                    multiStub.exec.yield(null);
                });

                it('executes the callback, passing no errors', function(){
                    expect(callbackStub.calledOnce).toEqual(true);
                    expect(callbackStub.args[0][0]).toEqual(null);
                });
            });
        });
    });

    describe('retrieveAllUrls', function(){
        beforeEach(function(){
            entries.retrieveAllUrls(callbackStub);
        });

        it('retrieves the complete index via client.hgetall', function(){
            expect(redisStub.hgetall.calledOnce).toEqual(true);
        });

        describe('if there is an error', function(){
            beforeEach(function(){
                redisStub.hgetall.yield(new Error('a wrong thing'));
            });

            it('executes the callback, passing the error', function(){
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
                expect(callbackStub.args[0][0].message).toEqual('a wrong thing');
            });
        });

        describe('if there are no errors', function(){
            beforeEach(function(){
                redisStub.hgetall.yield(null, [{entries: true}, {moreEntries:true}]);
            });

            it('executes the callback, passing no errors, and the entries', function(){
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][0]).toEqual(null);
                expect(callbackStub.args[0][1]).toEqual([{entries: true}, {moreEntries:true}]);
            });
        });
    });

});
