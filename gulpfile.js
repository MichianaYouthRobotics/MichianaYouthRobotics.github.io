
////////////////////////////////
//Setup//
////////////////////////////////

// Plugins
var gulp = require('gulp'),
    pjson = require('./package.json'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    pixrem = require('gulp-pixrem'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    spawn = require('child_process').spawn,
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    babel = require('gulp-babel');


// Relative paths function
var pathsConfig = function (appName) {
    this.app = "./";
    var vendorsRoot = 'node_modules/';

    return {
        app: this.app,
        css: this.app + '/css',
        sass: this.app + '/scss',
        fonts: this.app + '/font',
        images: this.app + '/img',
        js: this.app + '/js'
    }
};

var paths = pathsConfig();

////////////////////////////////
//Tasks//
////////////////////////////////

// Styles autoprefixing and minification


// Compile SCSS
gulp.task('css:compile', function() {
    return gulp.src('./scss/**/*.scss')
        .pipe(sass.sync({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./css'))
});

// Minify CSS
gulp.task('css:minify', ['css:compile'], function() {
    return gulp.src([
        './css/*.css',
        '!./css/*.min.css'
    ])
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.stream());
});

// CSS
gulp.task('styles', ['css:compile', 'css:minify']);

gulp.task('styles-old', function() {
    return gulp.src(paths.sass + '/*.scss')
        .pipe(sass({
            includePaths: [
                paths.sass
            ]
        }).on('error', sass.logError))
        .pipe(plumber()) // Checks for errors
        .pipe(autoprefixer({browsers: ['last 2 versions']})) // Adds vendor prefixes
        .pipe(pixrem())  // add fallbacks for rem units
        .pipe(gulp.dest(paths.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest(paths.css));
});

// Javascript minification
gulp.task('scripts', function() {
    return gulp.src([paths.js + '/*.js', '!' + paths.js + '/*.min.js'])
        .pipe(plumber()) // Checks for errors
        .pipe(babel({presets: ['env']}))
        .pipe(uglify()) // Minifies the js
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.js));
});


// Image compression
gulp.task('imgCompression', function(){
    return gulp.src(paths.images + '/*')
        .pipe(imagemin()) // Compresses PNG, JPEG, GIF and SVG images
        .pipe(gulp.dest(paths.images))
});

// Watch
gulp.task('watch', function() {
    gulp.watch(paths.sass + '/*.scss', ['styles']);
    gulp.watch(paths.js + '/*.js', ['scripts']).on("change", reload);
    gulp.watch(paths.images + '/*', ['imgCompression']);
});

// Default task
gulp.task('default', function() {
    runSequence(['styles', 'scripts', 'imgCompression'], ['watch']);
});
