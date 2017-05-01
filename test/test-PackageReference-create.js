const chai = require("chai");
const should = chai.should();

chai.use(require("chai-fs"));

const PackageReference = require("../PackageReference");
const MockMono = require("./MockMono");

describe("PackageReference#create", function() {

  let tmpDir = null;

  beforeEach(function() {
    tmpDir = new MockMono();
    return tmpDir.init();
  });

  afterEach(function() {
    return tmpDir.cleanup();
  });

  describe("with simple packages", function() {

    beforeEach(function() {
      return Promise
        .all([
          tmpDir.pkg("a"),
          tmpDir.pkg("b"),
        ])
        .then(() => tmpDir.save("a", "b", "file:../b"))
        .then(() => tmpDir.install("a"))
        .then(() => {
          `${tmpDir.path}/a/node_modules/`.should.be.a.directory();
          `${tmpDir.path}/a/node_modules/b/`.should.be.a.directory();
          `${tmpDir.path}/a/node_modules/b/`.should.not.be.a.symlink();
        });
    });

    it("should create a symbolic link", function() {
      let ref = new PackageReference(`${tmpDir.path}/a`, "b", "file:../b", "dependency");
      return ref
        .create()
        .then(() => `${tmpDir.path}/a/node_modules/b`.should.be.a.symlink());
    });

  });

});
