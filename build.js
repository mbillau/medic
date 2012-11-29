var path                   = require('path'),
    shell                  = require('shelljs'),
    git_hooks              = require('apache-git-commit-hooks'),
    builder                = require('./src/build/builder'),
    updater                = require('./src/build/updater');

// Clean out temp directory, where we keep our generated apps
var temp = path.join(__dirname, 'temp');
shell.rm('-rf', temp);
shell.mkdir(temp);

var libs_that_weve_built = {};
// get latest commits (and set up interval for pinging for that)
git_hooks({period:1000 * 60 * 15 /* 15 mins */}, function(libraries) {
    if (libraries) {
        console.log('-------------------------------------------------');
        console.log('[GIT] New commits at ' + new Date());
        console.log('-------------------------------------------------');
        // Update relevant libraries
        // TODO: what if multiple commits are new?
        // TODO: build queuing system: every commit successfully built locally should be written to filesystem
        updater(libraries);

        // trigger builds only for relevant libraries
        builder(libraries);
    }
});
