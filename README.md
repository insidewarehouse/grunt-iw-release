grunt-iw-release
================

InsideWarehouse release/deploy flow.

## `release` task

1. Checks you're on `master` branch
2. Checks there are no pending changes
3. Bumps version (you need to provide `--bump=patch|minor|major`), updates `package.json`
4. Calls `build`
   * `build` should be defined to clean up, download/update any necessary data and generate the final bundle for `compress`
5. Calls `compress`
   * `compress` needs to be configured to produce the final `build/%APPNAME%-v%VERSION%.tgz`
   * Inside the archive there should be onlye one folder: `%APPNAME%-v%VERSION%`
6. If everything succeeds - commits the changes, tags the release and pushes to `origin`
   * If the Gruntfile is inside the git repo root - the tag/commit will be as if `npm version` was called
   * If the Gruntfile is in a subfolder, the tag/commit will be prefixed with `%APPNAME%`

### TODO

* Gracefully revert if `build`/`compress` fail

## `deploy` task

* Someday later :)

