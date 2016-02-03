var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    wiredep = require('wiredep').stream,
    pl = require('gulp-load-plugins')({
        lazy: false
    });

var paths = {
        'css': 'app/css/*.css',
        'scss': 'app/scss/*.scss',
        'html': 'app/*.html',
        'jade': 'app/markups/_pages/*.jade',
        'sprite': 'app/img/sprites/**/*.png',
        'js': 'app/js/*.js',
        'img': 'app/img/*',
        'watchJade': 'app/markups/**/*.jade',
        'watchScss': 'app/scss/**/*.scss'
    },
    dest = {
        'root': 'app',
        'img': 'app/img',
        'scssCommon': 'app/scss/_common',
        'css': 'app/css',
        'prodRoot': 'prod',
        'prodJs': 'prod/js',
        'prodCss': 'prod/css',
        'prodImg': 'prod/Img'
    };

//Sprites
gulp.task('sprite', function () {
    var spriteData = gulp.src(paths.sprite)
        .pipe(pl.plumber())
        .pipe(pl.spritesmith({
            imgName: '../img/sprite.png',
            cssName: '_sprite.scss',
            cssFormat: 'css',
            cssOpts: {
                cssSelector: function (item) {
                    var result = '.' + item.name,
                        index;

                    while (true) {
                        index = result.indexOf('$');

                        if (index !== -1) {
                            result = result.replace(result.charAt(index), ':');
                        } else break;
                    }

                    return result;
                }
            },
            padding: 70
        }));
    spriteData.img
        .pipe(pl.rename('sprite.png'))
        .pipe(gulp.dest(dest.img));
    spriteData.css.pipe(gulp.dest(dest.scssCommon));
});

//Compass
gulp.task('compass', function () {
    gulp.src('app/scss/main.scss')
        .pipe(pl.plumber())
        .pipe(pl.compass({
            config_file: 'config.rb',
            css: dest.css,
            sass: 'app/scss',
            sourcemap: true
        }));
});

//Concat
gulp.task('concat', function () {
    return gulp.src(paths.css)
        .pipe(pl.plumber())
        .pipe(pl.concatCss('main.css'))
        .pipe(gulp.dest(dest.css));
});

//Prefix
gulp.task('prefix', function () {
    return gulp.src(paths.css)
        .pipe(pl.plumber())
        .pipe(pl.autoPrefix({
            browsers: ['> 1%', 'IE 8'],
            cascade: false
        }))
        .pipe(gulp.dest(dest.css));
});

//Jade
gulp.task('jade', function () {
    return gulp.src(paths.jade)
        .pipe(pl.plumber())
        .pipe(pl.jade({
            pretty: true
        }))
        .pipe(gulp.dest(dest.root));
});

//Server
gulp.task('server', function () {
    browserSync({
        port: 9000,
        server: {
            baseDir: 'app'
        }
    });
});

//Wiredep
gulp.task('wiredep', function () {
    return gulp.src(paths.html)
        .pipe(pl.plumber())
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest(dest.root));
});

//Useref
gulp.task('useref', ['wiredep'], function () {
    return gulp.src(paths.html)
        .pipe(pl.plumber())
        .pipe(pl.useref())
        .pipe(gulp.dest(dest.root));
});

//Watch
gulp.task('watch', function () {
    gulp.watch(paths.watchJade, ['jade']);
    gulp.watch(paths.watchScss, ['compass']);
    gulp.watch(paths.html, ['wiredep']);
    gulp.watch([
        paths.html,
        paths.js,
        paths.css
    ]).on('change', browserSync.reload);
});

//Uglify JS
gulp.task('uglify', function(){
    return gulp.src(paths.js)
        .pipe(pl.plumber())
        .pipe(pl.uglify())
        .pipe(gulp.dest(dest.prodJs));
});

//Mini CSS
gulp.task('mincss', function(){
    return gulp.src(paths.css)
        .pipe(pl.plumber())
        .pipe(pl.cssnano())
        .pipe(gulp.dest(dest.prodCss));
});

//Move
gulp.task('move', function(){
    gulp.src([paths.html, 'app/favicon.ico'])
        .pipe(gulp.dest(dest.prodRoot));
    gulp.src(paths.img)
        .pipe(gulp.dest(dest.prodImg));
});

//Production
gulp.task('prod', ['uglify', 'mincss', 'move']);

//Default
gulp.task('default', ['server', 'jade', 'compass', 'useref','watch']);