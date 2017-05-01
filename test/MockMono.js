const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs-extra"));
const tmp = require("tmp-promise");
const {exec} = require("child-process-promise");

/**
 * Creates mock monolithic repositories for testing.
*/
class MockMono {
  constructor() { }

  get path() { return this.o.path; }

  get manifest() { return `${this.path}/package.json`; }

  /**
   * Initializes the mock repository.
   * @return {Promise} resolves when the repository has been created.
  */
  init() {
    return tmp.dir({ unsafeCleanup: true }).then(o => this.o = o);
  }

  /**
   * Return the path to a dependency in the style of the NPM `dependencies` object.
  */
  ref(ref) {
    return `file:${this.path}/${ref}`;
  }

  /**
   * Creates a NodeJS package inside the mock repository.
   * @param {String} path the path to the package directory
   * @param {String} name the name of the package
   * @param {Object} manifest the contents of `package.json`.  If not provided, a default manifest will be created.
   * @return {Promise} resolves when the repository has been created.
  */
  pkg(path, name, manifest) {
    if(!name) { name = path; }
    if(!manifest) {
      manifest = {
        name: name,
        version: "0.0.0",
      };
    }
    return fs
      .ensureDirAsync(`${this.path}/${path}`)
      .then(() => fs.writeFileAsync(`${this.path}/${path}/package.json`, JSON.stringify(manifest, null, 2)));
  }

  /**
   * Adds an dependency to a package's manifest.
   * @param {String} path the path to the package's directory (which includes a `package.json` file)
   * @param {String} dependency the name of the dependency to install.
   * @param {String} version the version of the dependency to install.
   * @param {Boolean} devDependency if `true`, add the dependency to `devDependencies`.  Defaults to `false`.
   * @return {Promise} resolves when the dependency has been added to the manifest.
  */
  save(path, dependency, version, devDependency) {
    let pkg = `${this.path}/${path}/package.json`;
    return fs.readFileAsync(pkg, "utf8")
      .then(JSON.parse)
      .then((manifest) => {
        let section = devDependency ? "devDependencies" : "dependencies";
        if(!manifest[section]) { manifest[section] = {}; }
        manifest[section][dependency] = version;
        return manifest;
      })
      .then((manifest) => fs.writeFileAsync(pkg, JSON.stringify(manifest, null, 2)));
  }

  /**
   * Run `npm install` inside a package's directory.
   * @param {String} path the path to the package's directory.
   * @return {Promise} resolves when `npm install` has completed.
  */
  install(path) {
    return exec(`cd "${this.path}/${path}/" && npm install`);
  }

  /**
   * Cleans up from the mock repository.
  */
  cleanup() {
    if(!this.o) { return; }
    this.o.cleanup();
  }

}

module.exports = MockMono;
