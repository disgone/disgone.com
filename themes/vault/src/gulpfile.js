var gulp = require('gulp'),
    less = require('gulp-less'),
    mincss = require('gulp-csso');

gulp.task('default', []);

gulp.task('css', function () {
    return gulp.src('less/main.less')
        .pipe(less())
        .pipe(mincss())
        .pipe(gulp.dest('../static/css'))
});