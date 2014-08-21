module.exports = function (grunt) {

	grunt.loadNpmTasks("grunt-ssh");

	var fs = require("fs"),
		path = require("path"),
		shell = require("shelljs"),
		USER_HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE; // http://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way

	var deploymentInfo = grunt.config.get("pkg.deployment");

	var keyFile = path.join(USER_HOME, ".ssh", (deploymentInfo.keyFileName || "id-rsa"));
	if (!fs.existsSync(keyFile)) {
		grunt.fail.fatal("Key file not found: " + keyFile);
	}

	var privateKey = fs.readFileSync(keyFile).toString();
	grunt.log.ok("Loaded key from", keyFile);

	grunt.verbose.writeln("Will deploy to " + deploymentInfo.username + "@" + deploymentInfo.host + deploymentInfo.path);

	var sftpConfig = grunt.config.get("sftp") || {};
	sftpConfig.options = sftpConfig.options || {};
	sftpConfig.options.host = deploymentInfo.host;
	sftpConfig.options.username = deploymentInfo.username;
	sftpConfig.options.privateKey = privateKey;

	var bundleFileTemplate = "build/<%= pkg.name %>-v<%= pkg.version %>.tgz";
	sftpConfig.release = {
		src: [ bundleFileTemplate ],
		options: {
			srcBasePath: "build/",
			path: "<%= pkg.deployment.path %>/releases/",
			showProgress: true
		}
	};
	grunt.config.set("sftp", sftpConfig);

	var sshexecConfig = grunt.config.get("sshexec") || {};
	sshexecConfig.options = sftpConfig.options || {};
	sshexecConfig.options.host = deploymentInfo.host;
	sshexecConfig.options.username = deploymentInfo.username;
	sshexecConfig.options.privateKey = privateKey;

	sshexecConfig.checkupload = {
		command: "cd <%= pkg.deployment.path %>/releases/; [ ! -f <%= pkg.name %>-v<%= pkg.version %>.tgz ];"
	};
	sshexecConfig.extract = {
		command: "cd <%= pkg.deployment.path %>/releases/; tar xvzf <%= pkg.name %>-v<%= pkg.version %>.tgz >/dev/null"
	};
	sshexecConfig.symlink = {
		command: "ln -sfn <%= pkg.deployment.path %>/releases/<%= pkg.name %>-v<%= pkg.version %> <%= pkg.deployment.path %>/apps/<%= pkg.name %>"
	};
	if (!!grunt.config.get("pkg.scripts.start")) {
		sshexecConfig.restart = {
			command: "cd <%= pkg.deployment.path %>/apps/<%= pkg.name %>/; npm restart"
		};
	}
	if (!!fs.existsSync("restart.sh")) {
		// @todo: check if restart.sh is inside the bundle, not just the root... but let's assume the consumer of this knows what they're doing :)
		sshexecConfig.restart = {
			command: "cd <%= pkg.deployment.path %>/apps/<%= pkg.name %>/; bash ./restart.sh"
		};
	}
	grunt.config.set("sshexec", sshexecConfig);

	grunt.registerTask("deploy", "Deploy release bundle (uploads the bundle, extracts it, symlinks new version and restarts the service)", function () {

		var checkTag = grunt.config.get("bump.options.tagName").replace("%VERSION%", grunt.config.get("pkg.version"));

		var headOutput = shell.exec("git rev-list -1 HEAD", {silent: true});
		if (headOutput.code !== 0) {
			grunt.fail.fatal("Failed to detect the current commit");
		}

		var tagOutput = shell.exec("git rev-list -1 " + checkTag, {silent: true});
		if (tagOutput.code !== 0) {
			grunt.fail.fatal("Failed to detect the commit of tag '" + checkTag + "'");
		}

		var headCommit = headOutput.output.trim(), tagCommit = tagOutput.output.trim();
		if (headCommit !== tagCommit) {
			grunt.fail.fatal("Expected to be on commit '" + tagCommit + "' for tag '" + checkTag + "', but HEAD is at '" + headCommit + "'")
		}

		var bundlePath = grunt.config.process(bundleFileTemplate);
		if (!fs.existsSync(bundlePath)) {
			grunt.fail.fatal("No bundle file found at " + bundlePath);
		}

		// @todo: check remote conditions - %VERSION% is newer than what's on production OR passed in via --version
		grunt.task.run("sshexec:checkupload");
		grunt.task.run("sftp:release");
		grunt.task.run("sshexec:extract");
		grunt.task.run("sshexec:symlink");
		if (!!grunt.config("sshexec.restart")) {
			grunt.task.run("sshexec:restart");
		}

	});

};