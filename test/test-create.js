const chai = require("chai");
const should = chai.should();

chai.use(require("chai-fs"));

const Symlinker = require("../Symlinker");
const MockMono = require("./MockMono");

describe("Symlinker#create", function() {

  let tmpDir = null;
  let linker = null;

  beforeEach(function() {
    linker = new Symlinker();
    tmpDir = new MockMono();
    return tmpDir
      .init()
      .then(() => Promise.all([
        tmpDir.pkg("a", "a"),
        tmpDir.pkg("b", "b"),
      ]))
      .then(() => tmpDir.save("a", "b", "file:../b"))
      .then(() => tmpDir.install("a"));
  });

  afterEach(function() {
    return tmpDir.cleanup();
  });

  it("creates symlinks", function() {
    `${tmpDir.path}/a/node_modules/b/`.should.be.a.directory();
    `${tmpDir.path}/a/node_modules/b`.should.not.be.a.symlink();
    return linker
      .create(`${tmpDir.path}/a/package.json`)
      .then(() => {
        `${tmpDir.path}/a/node_modules/b`.should.be.a.symlink();
      });
  });

});
