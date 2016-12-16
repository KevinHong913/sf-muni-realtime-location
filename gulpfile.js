var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create();


gulp.task('sass', function(){
  return gulp.src('public/assets/scss/app.scss')
    .pipe(sass().on('error', sass.logError) ) // Using gulp-sass
    .pipe(gulp.dest('public/assets/css'))
});

gulp.task('watch', function() {
  gulp.watch(['public/assets/scss/*.scss', 'public/assets/scss/**/*.scss'], ['sass']);
});
