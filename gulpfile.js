var
path = require('path'),
es = require('event-stream'),
bowerFiles = require('main-bower-files'),
gulp = require('gulp'),
sass = require('gulp-sass'),
rename = require('gulp-rename'),
inject = require('gulp-inject'),
concat = require("gulp-concat"),
uglify = require("gulp-uglify"),
ngHtml2Js = require("gulp-ng-html2js"),
ngAnnotate = require('gulp-ng-annotate'),
minifyHtml = require('gulp-minify-html'),
minifyCss = require('gulp-minify-css');

var
pathRoot  = __dirname,
pathSrc   = path.join(pathRoot, 'src'),
pathBuild = path.join(pathRoot, 'build'),
fileTpl   = 'app.tpl.js',
fileCore  = 'app.js';

gulp.task('default', [
  'sass',
  'app-templates',
  'app-core',
  'inject-app-html',
  'watch'
]);

gulp.task('inject-app-scss', function (done) {
  var
  srcApp  = path.join(pathSrc, 'app'),
  srcFile = path.join(srcApp, 'app.scss'),
  files   = gulp.src([
    path.join(pathSrc, '**/*.scss'),
    '!' + srcFile
  ], { read: false });

  return gulp.src(srcFile)
    .pipe(inject(files, {
      transform: function(filePath) {
        filePath = filePath.replace('/src', './');
        return '@import \'' + filePath + '\';';
      },
      starttag: '// injector',
      endtag: '// endinjector'
    }))
    .pipe(gulp.dest(srcApp)); // overwrites source file
});

gulp.task('inject-app-html', function (done) {
  var
  sourceFile = path.join(pathSrc, 'index.html'),
  sources = gulp.src([
    path.join(pathBuild, fileCore.replace('.js','.min.js')),
    path.join(pathBuild, fileTpl.replace('.js','.min.js')),
    path.join(pathBuild, 'app.min.css')
  ], {
    cwd: pathBuild
  });

  return gulp.src(sourceFile)
    .pipe(inject(gulp.src(bowerFiles(), { read: false, base: 'bower_components' }), {
      name: 'bower',
      addRootSlash: false
    }))
    .pipe(inject(sources, {
      ignorePath: '/build/',
      addRootSlash: false
    }))
    .pipe(gulp.dest(pathBuild))
});

gulp.task('sass', ['inject-app-scss'], function(done) {
  gulp.src([path.join(pathSrc, 'app.scss')])
    .pipe(sass())
    // .pipe(gulp.dest(pathBuild))
    .pipe(minifyCss({ keepSpecialComments: 0 }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(pathBuild))
    .on('end', done);
});

gulp.task('app-templates', function(done) {
  return gulp.src([
      path.join(pathSrc, '**/*.html')
    ])
    .pipe(minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(ngHtml2Js({
      moduleName: 'coordinate-vx.tpl'
      // prefix: '/vx'
    }))
    .pipe(concat(fileTpl))
    // .pipe(gulp.dest(pathBuild))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(pathBuild));
});

gulp.task('app-core', function(done) {
  return gulp.src([
      path.join(pathSrc, '**/*.js')
    ])
    .pipe(concat(fileCore))
    .pipe(ngAnnotate())
    // .pipe(gulp.dest(pathBuild))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(pathBuild));
});

gulp.task('watch', function() {
  gulp.watch(path.join(pathSrc, '**/*.scss'), ['sass']);
  gulp.watch(path.join(pathSrc, '**/*.html'), ['app-templates']);
  gulp.watch(path.join(pathSrc, '**/*.js'),   ['app-core']);
});
