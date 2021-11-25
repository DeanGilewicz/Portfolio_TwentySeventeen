var gulp = require("gulp"),
	autoprefixer = require("autoprefixer"),
	cssnano = require("cssnano"),
	del = require("del"),
	fs = require("fs"),
	handlebars = require("gulp-compile-handlebars"),
	jshint = require("gulp-jshint"),
	livereload = require("gulp-livereload"),
	postcss = require("gulp-postcss"),
	rename = require("gulp-rename"),
	sass = require("gulp-sass"),
	sourcemaps = require("gulp-sourcemaps"),
	babel = require("gulp-babel"),
	uglify = require("gulp-uglify");

// express server
// view on host computer -> localhost:4000
// view on mobile device -> in command line of computer run ifconfig, look for en0, en1 etc and "inet" number. Use this number plus port
// e.g. 00.0.00.00:4000

function server() {
	var express = require("express");
	var app = express();
	app.use(express.static(__dirname + "/dist", { extensions: ["html"] }));
	app.listen(4000);
}

// JAVASCRIPT

// lint js files

function jsHint() {
	return gulp
		.src("scripts/**/*")
		.pipe(jshint())
		.pipe(jshint.reporter("jshint-stylish"));
}

// minifies js scripts - places into dist folder

function minifyMainJs() {
	return del(["dist/js/**/*", "!dist/{js/vendor,js/vendor/**/*}"]).then(() => {
		return gulp
			.src("scripts/**/*")
			.pipe(sourcemaps.init())
			.pipe(
				babel({
					presets: ["es2015"],
				}).on("error", function (e) {
					console.log(e.message);
					return this.end();
				})
			)
			.pipe(
				uglify().on("error", function (e) {
					console.log(e.message);
					return this.end();
				})
			)
			.pipe(
				rename(function (path) {
					path.extname = ".min.js";
				})
			)
			.pipe(sourcemaps.write("./"))
			.pipe(gulp.dest("dist/js"))
			.pipe(livereload());
	});
}

// SASS

// compile sass into css and minify - place into dist folder

function minifyCss() {
	return del(["dist/css/**/*"]).then(() => {
		var processors = [
			autoprefixer({
				browsers: [
					"last 4 version",
					"safari 5",
					"ie 8",
					"ie 9",
					"opera 12.1",
					"ios 6",
					"android 4",
				],
			}),
			cssnano,
		];
		return gulp
			.src("styles/sass/main.scss")
			.pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
			.pipe(sourcemaps.init())
			.pipe(postcss(processors))
			.pipe(rename("main.min.css"))
			.pipe(sourcemaps.write("./"))
			.pipe(gulp.dest("dist/css"))
			.pipe(livereload());
	});
}

// HANDLEBARS

// make data and partials available in project
// compile handlebars templates - place in dist as .html files

function compileHtml() {
	return del(["dist/**/*.html"]).then(() => {
		var data = JSON.parse(fs.readFileSync("data/data.json")); // data to pass into templates
		options = {
			ignorePartials: true, // ignores any unknown partials
			batch: ["partials"],
		};
		return gulp
			.src("templates/**/*.hbs")
			.pipe(handlebars(data, options))
			.pipe(
				rename(function (path) {
					path.extname = ".html";
				})
			)
			.pipe(gulp.dest("dist/"))
			.pipe(livereload());
	});
}

// ASSETS

// copy fonts folder into dist/

// function assetsFonts() {
// 	return del(["dist/fonts/**/*"], function () {
// 		return gulp.src(["assets/fonts/**/*"]).pipe(gulp.dest("dist/fonts/"));
// 	});
// }

// copy images folder into dist/

function assetsImages() {
	return del(["dist/images/**/*"]).then(() => {
		return gulp.src(["assets/images/**/*"]).pipe(gulp.dest("dist/images/"));
	});
}

// GULP TASKS

// watch directories / files and update when changes are made

function watchFiles() {
	livereload.listen({ quiet: true }); // disable console log of reloaded files
	gulp.watch(["styles/sass/**"], gulp.series(["minifyCss"]));
	gulp.watch(["scripts/**/*"], gulp.series(["jsHint", "minifyMainJs"]));
	gulp.watch(["templates/**"], gulp.series(["compileHtml"]));
	gulp.watch(["partials/*.hbs"], gulp.series(["compileHtml"]));
	gulp.watch(["data/data.json"], gulp.series(["compileHtml"]));
	gulp.watch(["assets/**/*"], gulp.series(["assetsImages"]));
}

// register default gulp tasks

exports.default = gulp.parallel(
	server,
	watchFiles,
	minifyCss,
	compileHtml,
	assetsImages,
	gulp.series(jsHint, minifyMainJs, function logMessage() {
		console.log("gulp is watching and will rebuild when changes are made...");
	})
);

// build distribution files

exports.build = gulp.parallel(
	minifyCss,
	minifyMainJs,
	compileHtml,
	assetsImages
);

exports.server = server;
exports.jsHint = jsHint;
exports.minifyMainJs = minifyMainJs;
exports.minifyCss = minifyCss;
exports.compileHtml = compileHtml;
// exports.assetsFonts = assetsFonts;
exports.assetsImages = assetsImages;
exports.watchFiles = watchFiles;
// exports.default = default;
