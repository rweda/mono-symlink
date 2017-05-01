const chai = require("chai");
const should = chai.should();

const Symlinker = require("../Symlinker");
const PackageReference = require("../PackageReference");
const MockMono = require("./MockMono");

describe("Symlinker#filter", function() {

  let tmpDir = null;
  let linker = null;

  beforeEach(function() {
    linker = new Symlinker();
    tmpDir = new MockMono();
    return tmpDir.init();
  });

  afterEach(function() {
    return tmpDir.cleanup();
  });

  it("returns local dependencies", function() {
    let arr = linker.filter(tmpDir.manifest, {
      a: tmpDir.ref("a"),
    }, {});
    arr.length.should.equal(1);
  });

  it("returns local devDependencies", function() {
    let arr = linker.filter(tmpDir.manifest, {}, {
      a: tmpDir.ref("a"),
    });
    arr.length.should.equal(1);
  });

  it("filters out remote dependencies", function() {
    let arr = linker.filter(tmpDir.manifest, {
      a: tmpDir.ref("a"),
      express: "^4.0.0",
      b: tmpDir.ref("b"),
    }, {});
    arr.length.should.equal(2);
    arr.map(i => i.name).should.deep.equal(["a", "b"]);
  });

  describe("handles empty dependencies", function() {

    let obj = null;
    beforeEach(function() {
      obj = { a: tmpDir.ref("a"), };
    });

    it("should work with no devDependencies", function() {
      linker.filter(tmpDir.manifest, obj, null).length.should.equal(1);
    });

    it("should work with no dependencies", function() {
      linker.filter(tmpDir.manifest, null, obj).length.should.equal(1);
    });

    it("should work with no devDependencies or dependencies", function() {
      linker.filter(tmpDir.manifest, null, null).length.should.equal(0);
    });

  });

  describe("produces Array<PackageReference>", function() {

    let arr = null;

    beforeEach(function() {
      arr = linker.filter(tmpDir.manifest,
        { "a": tmpDir.ref("a"), },
        { "b": tmpDir.ref("b"), });
    });

    it("should produce output", function() {
      arr.length.should.equal(2);
    })

    it("should be instanceof PackageReference", function() {
      for(ref of arr) {
        ref.should.be.an.instanceof(PackageReference);
      }
    });

  });

});
