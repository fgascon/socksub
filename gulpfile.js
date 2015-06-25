var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['compile']);

gulp.task('clean', function(callback){
	del(['browser/dist/'], callback);
});

gulp.task('compile', ['clean'], function(){
	var b = browserify({
		entries: 'browser/src/index.js',
		standalone: 'socksub',
		debug: true
	});
	
	return b.bundle()
		.pipe(source('socksub.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(uglify())
			.on('error', gutil.log)
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('browser/dist/'));
});