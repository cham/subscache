'use strict';
var SandboxedModule = require('sandboxed-module');
var sinon = require('sinon');
var sandbox = sinon.sandbox.create();
var fetcher;

describe('getData', function(){
    var callbackStub;
    var fakeRequest;

    beforeEach(function(){
        callbackStub = sandbox.stub();
        fakeRequest = sandbox.stub();
        fakeRequest.defaults = sandbox.stub().returns(fakeRequest);

        fetcher = SandboxedModule.require('../../../src/fetcher', {
            requires: { 'request': fakeRequest }
        });

        fetcher.getData('http://beedogs.com', callbackStub);
    });

    afterEach(function(){
        sandbox.restore();
    });

    it('makes a GET request for the url given', function(){
        expect(fakeRequest.calledOnce).toEqual(true);
    });

    describe('when the GET resolves with data', function(){
        describe('if the response has a status code of 200', function(){
            beforeEach(function(){
                fakeRequest.yield(null, {statusCode: 200}, {someData: 'yep'});
            });

            it('executes the callback, passing the data as the second argument', function(){
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][0]).toEqual(null);
                expect(callbackStub.args[0][1]).toEqual({someData: 'yep'});
            });
        });

        describe('if the response does not have a status code of 200', function(){
            beforeEach(function(){
                fakeRequest.yield(null, {statusCode: 401}, {probablyBadData: 'it seems likely'});
            });

            it('executes the callback, passing a readable error message as the error', function(){
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
                expect(callbackStub.args[0][0].message).toEqual('The api responded with "Unauthorised"');
            });

            it('does not pass the data given with the response', function(){
                expect(callbackStub.calledOnce).toEqual(true);
                expect(callbackStub.args[0][1]).not.toBeDefined();
            });
        });
    });

    describe('when the GET errors', function(){
        beforeEach(function(){
            fakeRequest.yield(new Error('a bad thing'));
        });

        it('executes the callback, passing the error as the first argument', function(){
            expect(callbackStub.calledOnce).toEqual(true);
            expect(callbackStub.args[0][0] instanceof Error).toEqual(true);
            expect(callbackStub.args[0][0].message).toEqual('a bad thing');
        });
    });

    describe('when multiple identical GETs are submitted', function(){
        var numAdditionalCalls = 4;

        beforeEach(function(){
            for(var i = 0; i < numAdditionalCalls; i++){
                fetcher.getData('http://beedogs.com', callbackStub);
            }
        });

        it('only makes a single GET request', function(){
            expect(fakeRequest.calledOnce).toEqual(true);
        });

        describe('when the GET resolves with data', function(){
            beforeEach(function(){
                fakeRequest.yield(null, {statusCode: 200}, {someData: 'yep'});
            });

            it('executes all callbacks for that URL, passing the data', function(){
                expect(callbackStub.callCount).toEqual(numAdditionalCalls+1);
                for(var i = 0; i < numAdditionalCalls+1; i++){
                    expect(callbackStub.args[i][0]).toEqual(null);
                    expect(callbackStub.args[i][1]).toEqual({someData: 'yep'});
                }
            });
        });

        describe('when the GET errors', function(){
            beforeEach(function(){
                fakeRequest.yield(new Error('a bad thing'));
            });

            it('executes all callbacks for that URL, passing the error', function(){
                expect(callbackStub.callCount).toEqual(numAdditionalCalls+1);
                for(var i = 0; i < numAdditionalCalls+1; i++){
                    expect(callbackStub.args[i][0] instanceof Error).toEqual(true);
                    expect(callbackStub.args[i][0].message).toEqual('a bad thing');
                }
            });
        });
    });
});
