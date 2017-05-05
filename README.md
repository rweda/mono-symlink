# Monolithic Symlinker

Handles symbolic links between NodeJS packages inside a monolithic codebase.

```js
/* repository/core_lib/package.json */
{ "name": "core_lib" }

/* repository/server/package.json */
{ "name": "server",
  "dependencies": { "core_lib": "file:../core_lib" } }
```

Running the Symlinker on `server` will create a symbolic link from `server/node_modules/core_lib` to `core_lib`, so
changes to `core_lib` will be immediately available to `server`.

## Installation

```bash
npm install mono-symlink [--save-dev]
```

## Usage

```js
const Symlinker = require("mono-symlink");

symlinker = new Symlinker();
symlinker.create("repository/server/package.json");
```

The symlinker is designed to run after remote dependencies are installed via `npm install`.

Core Methods:
- `symlinker.create` will create symbolic links for all local dependencies listed in the given manifest file.
- `symlinker.remove` will remove the symbolic links that `symlinker.create` would add.

See the [documentation][Symlinker] for more information.

[Symlinker]: https://rweda.github.io/mono-symlink/Symlinker.html
