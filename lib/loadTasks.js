var path = require("path");

module.exports = function (grunt, fromModule) {
	var pkgPath = require.resolve(path.join(fromModule, "package.json"));
	var modulePath = path.dirname(pkgPath);
	var tasksPath = path.join(modulePath, "tasks");
	grunt.loadTasks(tasksPath);
};
