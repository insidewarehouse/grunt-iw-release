module.exports = function (grunt) {

	grunt.loadNpmTasks("grunt-bump");
	grunt.loadNpmTasks("grunt-checkbranch");
	grunt.loadNpmTasks("grunt-checkpending");

	grunt.registerTask("release", "Prepare release bundle (bump version, build, compress, commit, tag, push)", function () {
		var bumpLevel = grunt.option("bump");
		if (bumpLevel !== "minor" && bumpLevel !== "major" && bumpLevel !== "patch") {
			grunt.fail.fatal("Please provide `--bump=patch|minor|major`");
			return;
		}

		var shell = require("shelljs");

		var bumpOptions = {
			updateConfigs: [ "pkg" ],
			pushTo: "origin",
			commitFiles: [ "-a" ],
			commitMessage: "%VERSION%",
			tagName: "v%VERSION%",
			tagMessage: "%VERSION%"
		};
		var toplevelOutput = shell.exec("git rev-parse --show-toplevel", { silent: !!grunt.option('verbose') });
		if (toplevelOutput.code !== 0) {
			grunt.fail.fatal("Failed to detect top level git folder");
		}

		var topLevelPath = toplevelOutput.output.trim();
		if (grunt.file.isPathCwd(topLevelPath)) {
			var pkgName = grunt.config.get("pkg.name");
			bumpOptions.commitMessage = "[" + pkgName + "] v%VERSION%";
			bumpOptions.tagName = pkgName + "-v%VERSION%";
			bumpOptions.tagMessage = "Build tag: " + pkgName + "-v%VERSION%";
		}

		grunt.config.set("bump", { options: bumpOptions });

		grunt.task.run("checkbranch:master");
		grunt.task.run("checkpending");

		grunt.task.run("bump-only:" + bumpLevel);

		grunt.task.run("build");
		grunt.task.run("compress");

		grunt.task.run("bump-commit");
	});

};
