var gulp = require('gulp'),
    livereload = require('gulp-livereload');


gulp.task('livereload', function() {
  setTimeout(function(){
    livereload.reload();
  },150)
      
});

/*
    var react = require('gulp-react');
var exec = require('child_process').exec;
gulp.task('react', function () {
    return gulp.src('template.jsx')
        .pipe(react())
        .pipe(gulp.dest('dist'));
});
*/
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['./public/**/*', './public/**/**/*'], ['livereload']);
});