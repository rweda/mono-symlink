/**
 * Describes the type of reference.
 * @typedef {('dependency'|'devDependency')} DependencyType
*/

const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs-extra"));
const path = require("path");

/**
 * Describes a single package reference.
*/
class PackageReference {

  /**
   * @param {String} source the path to the directory that defines this reference.
   * @param {String} name the package name being required
   * @param {String} location the reference text
   * @param {DependencyType} type the type of dependency
  */
  constructor(source, name, location, type) {
    this.source = source;
    this.name = name;
    this.location = location;
    this.type = type;
  }

  /**
   * Create a symbolic link for this reference.
   * @return {Promise} resolves when the symbolic link has been created.
  */
  create() {
    let symlink = path.resolve(this.source, "node_modules", this.name);
    let target = path.resolve(this.source, this.location.replace("file:", ""));
    return fs
      .removeAsync(symlink)
      .catch(err => yes)
      .then(() => fs.ensureSymlinkAsync(target, symlink));
  }

}

module.exports = PackageReference;
