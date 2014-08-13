grunt-iw-release
================

InsideWarehouse release/deploy flow.

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

1. TODO: Check initial conditions
   * branch
   * pending changes
   * tag / version
   * tgz present, alternative: download tgz from github
2. TODO: Check remote conditions
   * tgz not uploaded yet
   * version folder not present yet
3. TODO: Upload tgz
   * alternative: download tgz from github
4. TODO: Extract tgz remotely
5. TODO: symlink to new version
6. TODO: restart service, if needed
   * if `package.json` contains `scripts.start` - execute `npm restart`
   * if `restart.sh` present - execute `bash restart.sh`
