grunt-iw-release
================

InsideWarehouse release/deploy flow.

TODO: wait for it... wait for it... document options :)

## `release` task

1. Checks you're on `master` branch
   * TODO: can we add a double check that you actually made changes since last release (i.e. `develop` is merged in)?
2. Checks there are no pending changes
3. Bumps version (you need to provide `--bump=patch|minor|major`), updates `package.json`
4. Calls `build`
   * `build` should be defined to clean up, download/update any necessary data and generate the final bundle for `compress`
5. Calls `compress`
   * `compress` needs to be configured to produce the final `build/%APPNAME%-v%VERSION%.tgz`
   * Inside the archive there should be onlye one folder: `%APPNAME%-v%VERSION%`
   * TODO: ensure output tgz is named by convention
6. If everything succeeds - commits the changes, tags the release and pushes to `origin`
   * If the Gruntfile is inside the git repo root - the tag/commit will be as if `npm version` was called
   * If the Gruntfile is in a subfolder, the tag/commit will be prefixed with `%APPNAME%`
   * TODO: Gracefully revert if `build`/`compress` fail
   * TODO: upload tgz to github
   * TODO: merge updated `package.json` back into `develop`? 

## `deploy` task

1. Checks you're still on the same commit as the version in the package
2. Checks tgz not already uploaded
   * TODO: check version folder not present yet
   * TODO: check version is newer or explicit than what's on production
3. Uploads tgz
   * TODO: do we have a place to store tgz for future?
4. Extracts tgz remotely
5. Symlinks to new version
6. Restarts service, if needed
   * if `package.json` contains `scripts.start` - executes `npm restart`
   * if `restart.sh` present - executes `bash restart.sh`
