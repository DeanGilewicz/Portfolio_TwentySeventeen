var gulp = require('gulp'),
	autoprefixer = require('autoprefixer'),
	cssnano = require('cssnano'),
	del = require('del'),
	fs = require('fs'),
	handlebars = require('gulp-compile-handlebars'),
	jshint = require('gulp-jshint'),
	livereload = require('gulp-livereload'),
	postcss = require('gulp-postcss'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'), 
	babel = require('gulp-babel'), 
	uglify = require('gulp-uglify');

// express server
	// view on host computer -> localhost:4000
	// view on mobile device -> in command line of computer run ifconfig, look for en0, en1 etc and "inet" number. Use this number plus port
	// e.g. 00.0.00.00:4000

gulp.task('express', function() {
	var express = require('express');
	var app = express();
	app.use(express.static(__dirname + '/dist', {'extensions': ['html']}));
	app.listen(4000);
});


// JAVASCRIPT

	// lint js files

gulp.task('jshint', function() {
	return gulp.src('scripts/**/*')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

	// minifies js scripts - places into dist folder

gulp.task('minify-main-js', function() {
	del(['dist/js/**/*', '!dist/{js/vendor,js/vendor/**/*}'], function() {
		return gulp.src('scripts/**/*')
			.pipe(sourcemaps.init())  
			.pipe(babel({
				presets: ['es2015']
			}).on('error', function(e) {
				console.log(e.message);
				return this.end();
			})) 
			.pipe(uglify().on('error', function(e) {
				console.log(e.message);
				return this.end();
			}))
			.pipe(rename(function(path) {
				path.extname = '.min.js';
			}))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest('dist/js'))
			.pipe(livereload());
	});
});



// SASS

	// compile sass into css and minify - place into dist folder

gulp.task('minify-css', function() {
	del(['dist/css/**/*'], function() {
		var processors = [
			autoprefixer({browsers: ['last 4 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']}),
			cssnano
		];
		return gulp.src('styles/sass/main.scss')
			.pipe(sass({ outputStyle: 'expanded' })
				.on('error', sass.logError)
			)
			.pipe(sourcemaps.init())
			.pipe(postcss(processors))
			.pipe(rename('main.min.css'))
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest('dist/css'))
			.pipe(livereload());
	});
});


// HANDLEBARS

	// make data and partials available in project
	// compile handlebars templates - place in dist as .html files

gulp.task('handlebars', function () {
	del(['dist/**/*.html'], function() {
		var data = JSON.parse(fs.readFileSync('data/data.json')); // data to pass into templates
		options = {
			ignorePartials: true, // ignores any unknown partials
			batch : ['partials']
		};
		return gulp.src('templates/**/*.hbs')
			.pipe(handlebars(data, options))
			.pipe(rename(function(path) {
				path.extname = '.html';
			}))
			.pipe(gulp.dest('dist/'))
			.pipe(livereload())
	});
});


// ASSETS

	// copy fonts folder into dist/

// gulp.task('assets-fonts', function() { 
// 	return gulp.src(['assets/fonts/*'])
//     	.pipe(gulp.dest('dist/fonts/'));
// });

	// copy images folder into dist/

gulp.task('assets-images', function() { 
	return gulp.src(['assets/images/**/*'])
    	.pipe(gulp.dest('dist/images/'));
});


// DELETE

	// delete non vendor dist files

// gulp.task('clean-js', function() {
// 	del(['dist/js/**/*', '!dist/{js/vendor,js/vendor/**/*}']);
// });

	// delete minimized css dist files

// gulp.task('clean-css', function() {
// 	del(['dist/css/**/*']);
// });

	// delete images from dist

gulp.task('clean-imgs', function() {
	del(['dist/images/**/*']);
});

	// delete html files from dist

// gulp.task('clean-html', function() {
// 	del(['dist/**/*.html']);
// });



// GULP TASKS

	// watch directories / files and update when changes are made

gulp.task('watch', function() {
	livereload.listen({ quiet: true }); // disable console log of reloaded files
	gulp.watch(['styles/sass/**'], ['minify-css']);
	gulp.watch(['scripts/**/*'], ['jshint','minify-main-js']);
	gulp.watch(['templates/**'], ['handlebars']);
	gulp.watch(['partials/*.hbs'], ['handlebars']);
	gulp.watch(['data/data.json'], ['handlebars']);
	gulp.watch(['assets/**/*'], ['clean-imgs', 'assets-images']);
});

	// register default gulp tasks

gulp.task('default', ['express', 'watch', 'jshint', 'minify-css', 'minify-main-js', 'handlebars', 'assets-images'], function() {
	console.log('gulp is watching and will rebuild when changes are made...');
});

	// register initial gulp tasks

gulp.task('build', ['minify-css', 'minify-main-js', 'handlebars', 'assets-images'], function() {
	console.log('Your development environment has been set up. Run gulp to watch and build your project!');
});

