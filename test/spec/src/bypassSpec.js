'use strict';
var bypass = require('../../../src/bypass');

describe('bypass', function(){
    describe('skipCache', function(){
        it('returns true if the URL ends in "favicon.ico"', function(){
            expect(bypass.skipCache('http://anything.com/favicon.ico')).toEqual(true);
        });

        it('returns true if the URL contains "/commandcenter/"', function(){
            expect(bypass.skipCache('http://anything.com/commandcenter/')).toEqual(true);
            expect(bypass.skipCache('http://anything.com/commandcenter/dsa/asd/1231/foobar')).toEqual(true);
        });
    });
});
