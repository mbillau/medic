var shell     = require('shelljs'),
    path      = require('path'),
    libraries = require('../../../libraries'),
    config    = require('../../../config'),
    fs        = require('fs');

var jasmineReporter = path.join(__dirname, 'mobile_spec', 'jasmine-jsreporter.js');

module.exports = function(output_location, sha, devices, entry_point, callback) {
    shell.rm('-Rf', output_location);
    shell.mkdir('-p', output_location);
    var tempAll = path.join(output_location, 'autotest', 'pages', 'all.html');

    // checkout correct sha
    var cmd = 'cd ' + libraries.paths.test + ' && git checkout ' + sha;
    shell.exec(cmd, {silent:true, async:true}, function(code, output) {
        if (code > 0) {
            console.error('[ERROR] [BUILDER] [TEST APP] Error during git-checkout of test app SHA! command executed was: ' + cmd + ', output: ' + output);
            callback(true);
        } else {
            // copy relevant bits of mobile-spec project to output_location location
            shell.cp('-Rf', [path.join(libraries.paths.test, 'autotest'), path.join(libraries.paths.test, 'cordova.js'), path.join(libraries.paths.test, 'master.css'), path.join(libraries.paths.test, 'main.js')], output_location);

            // copy jasmine reporter into output_location location
            shell.cp('-Rf', jasmineReporter, output_location);
            
            // drop sha to the top of the jasmine reporter
            var tempJasmine = path.join(output_location, 'jasmine-jsreporter.js');
            fs.writeFileSync(tempJasmine, "var mobile_spec_sha = '" + sha + "';\n" + fs.readFileSync(tempJasmine, 'utf-8'), 'utf-8');

            // replace a few lines under the "all" tests autopage
            fs.writeFileSync(tempAll, fs.readFileSync(tempAll, 'utf-8').replace(/<script type=.text.javascript. src=.\.\..html.TrivialReporter\.js.><.script>/, '<script type="text/javascript" src="../html/TrivialReporter.js"></script><script type="text/javascript" src="../../jasmine-jsreporter.js"></script>'), 'utf-8');
            fs.writeFileSync(tempAll, fs.readFileSync(tempAll, 'utf-8').replace(/jasmine.HtmlReporter.../, 'jasmine.HtmlReporter(); var jr = new jasmine.JSReporter("' + config.couchdb.host + '");'), 'utf-8');
            fs.writeFileSync(tempAll, fs.readFileSync(tempAll, 'utf-8').replace(/addReporter.htmlReporter../, 'addReporter(htmlReporter);jasmineEnv.addReporter(jr);'), 'utf-8');
            callback();
        }
    });
}
