'use strict';
var pug     = require('gulp-pug'),
    sass     = require('gulp-sass'),
    connect = require('gulp-connect'),
    plumber = require('gulp-plumber'),
    changed = require('gulp-changed'),
    jshint = require('gulp-jshint'),
    gutil      = require('gulp-util'),
    webpack = require('webpack-stream'),
    YamlData = require('vinyl-yaml-data'),
    deepExtend = require('deep-extend-stream'),
    gulp    = require('gulp');


function onError (error) {
    gutil.log(error);
    this.emit('end');
}
var locals;

gulp.task('data', () =>{
  locals = {};
  return gulp.src('templates/data/main.yaml')
    .pipe(YamlData())
    .pipe(deepExtend(locals))
    .pipe(connect.reload());
});

gulp.task('pug',function (){
  return gulp.src('templates/files/*.pug')
  .pipe( plumber({ errorHandler: onError }) )
  .pipe( changed('web'))
  .pipe(pug({
    data: locals,
    pretty: true
  }))
  .pipe(gulp.dest('web'))
  .pipe(connect.reload());
  
});

gulp.task('sass', function () {
    var config = {
        outputStyle : 'compressed'
    };
  return gulp.src('templates/scss/main.scss')
    .pipe(sass(config) )
    .pipe( plumber({ errorHandler: onError }) )
    .pipe( changed('web'))
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('web/css'))
    .pipe(connect.reload());
});

gulp.task('connect-server', function() {
  connect.server({
    root: 'web',
    port: 5000,
    livereload: true
  });
});

gulp.task('js', function () {
    return gulp.src('templates/javascript/application.js')
        .pipe( jshint() )
        .pipe( jshint.reporter( require('jshint-stylish') ) )
        .pipe( plumber({ errorHandler: onError }) )
        .pipe( webpack({
            watch: true,
            output: {
                filename: 'main.js'
            }
        }))
        .pipe(gulp.dest('web/js') )
        .pipe(connect.reload() );
});


gulp.task('watch', function () {
gulp.watch('templates/data/**/*.yaml', ['data', 'pug']);
gulp.watch('templates/files/**/*.pug', ['pug']);
gulp.watch('templates/scss/*.scss', ['sass']);
gulp.watch('templates/javascript/**/*.js', ['js']);

});

gulp.task('default',['connect-server','watch','data']);