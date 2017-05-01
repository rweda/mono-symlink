const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const path = require("path");

/**
 * Options to configure {@link Symlinker}.
 * @typedef {Object} SymlinkerOptions
*/


/**
 * Constructs and removes symbolic links between local packages a monolithic repository.
*/
class Symlinker {

  /**
   * A {@link PackageReference} class to use when manipulating packages.
   * Can be overridden by a class that extends {@link PackageReference}.
   * @example <caption>Overriding PackageReference</caption>
   * class CustomPackageReference extends PackageReference { }
   * Symlinker.PackageReference = CustomPackageReference;
   * let linker = new Symlinker();
   * let refs = linker.filter(...); // => Array<CustomPackageReference>
  */
  static get PackageReference() { return this._packageReference || require("./PackageReference"); }

  static set PackageReference(val) { this._packageReference = val; }

  /**
   * @param {SymlinkerOptions} opts configuration options.
  */
  constructor(opts) {
    /**
     * Configuration options.
     * @type {ManifestSearchOptions}
    */
    this._opts = opts || {};
  }

  /**
   * Given all package dependencies, provides the symbolic links that should be created, filtering out dependencies that
   * shouldn't be symlinked.
   * @param {String} source the location of the manifest file being analyzed
   * @param {null|Object<String, String>} dependencies the list of dependencies for a package.
   * @param {null|Object<String, String>} devDependencies the list of development dependencies for a package.
   * @return {Array<PackageReference>} the packages that should be symbolicly linked.
  */
  filter(source, dependencies, devDependencies) {
    let PackageReference = this.constructor.PackageReference;
    let refs = [];
    let deps = Object.assign({}, dependencies, devDependencies);
    for (var name in deps) {
      let location = deps[name];
      if(!deps.hasOwnProperty(name)) { continue; }
      if(location.indexOf("file:") < 0) { continue; }
      let type = dependencies && [name] ? "dependency" : "devDependency";
      refs.push(new PackageReference(path.dirname(source), name, location, type));
    }
    return refs;
  }

  /**
   * Create symbolic links for all local resources inside a package.
   * @param {String} manifest the path to a manifest (`package.json`) file.
   * @return {Promise} resolves when all symbolic links have been created.
  */
  create(manifest) {
    return fs
      .readFileAsync(manifest, "utf8")
      .then(JSON.parse)
      .then(({name, dependencies, devDependencies}) => this.filter(manifest, dependencies, devDependencies))
      .then((symlinks) => Promise.all(symlinks.map(symlink => symlink.create())));
  }

}

module.exports = Symlinker;
