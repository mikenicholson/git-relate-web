"use strict";
var NumstatParser = require('../lib/numstat_parser.js');

describe("parsing numstat entries", function () {

    var parser = new NumstatParser();

    describe('parsing an empty buffer', function () { 
        
        it('should return empty array of file entries', function () {
            var res = parser.parseBuffer(new Buffer(0));
            expect(res.length).to.equal(0);
        });
    });
    
    describe('parsing a numstat line without rename or copy', function () {
    
        var readMeFile = new Buffer('75\t42\tREADME.md\0'),
            fooFile = new Buffer('0\t1\tfoo.bar\0');
     

        it('should parse added lines', function () {
            var res = parser.parseBuffer(readMeFile)[0];

            expect(res.addedLines).to.equal(75);
        });     


        it('should parse added lines from another file', function () {
            var res = parser.parseBuffer(fooFile)[0];

            expect(res.addedLines).to.equal(0);
        });


        it('should parse deleted lines', function() {
            var res = parser.parseBuffer(readMeFile)[0];

            expect(res.deletedLines).to.equal(42);
        });


        it('should parse deleted lines from another file', function () {
            var res = parser.parseBuffer(fooFile)[0];

            expect(res.deletedLines).to.equal(1);
        });


        it('should parse the file name', function () {
            var res = parser.parseBuffer(readMeFile)[0];

            expect(res.fileName).to.equal('README.md');
        });


        it('should parse the name from another file', function () {
            var res = parser.parseBuffer(fooFile)[0];

            expect(res.fileName).to.equal('foo.bar');
        });


        it('should set renamed to false', function () {
            var res = parser.parseBuffer(readMeFile)[0];

            expect(res.renamed).to.be.false;
        });


    });


    describe('parsing a numstat line with rename', function () {
        var renamedFileLine = new Buffer('23\t29\t\0/path/to/oldName.js\0/path/to/newName.js\0');

        it('should set renamed to true', function() {
            var res = parser.parseBuffer(renamedFileLine)[0];

            expect(res.renamed).to.equal(true);
        });


        it('should parse the previous file name', function() {
            var res = parser.parseBuffer(renamedFileLine)[0];

            expect(res.previousFileName).to.equal('/path/to/oldName.js');
        });


        it('should parse the new file name', function () {
            var res = parser.parseBuffer(renamedFileLine)[0];

            expect(res.fileName).to.equal('/path/to/newName.js');
        });
        
    });


    describe('parsing three lines', function ()  {
        var multipleLines = new Buffer('23\t29\t\0/path/to/oldName.js\0/path/to/newName.js\0'
            + '75\t42\tREADME.md\0'
            + '0\t1\tfoo.bar\0');

        it ('should produce three entries', function () {
            var res = parser.parseBuffer(multipleLines);

            expect(res.length).to.equal(3);
        });
    });
});

