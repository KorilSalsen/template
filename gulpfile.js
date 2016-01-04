var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    pl = require('gulp-load-plugins')({
        lazy: false
    });

var paths = {
    'css': 'app/css/*.css',
    'scss': 'app/scss/*.scss',
    'html': 'app/*.html',
    'jade': 'app/markups/_pages/*.jade',
    'sprite': 'app/img/sprites/**/*.png',
    'js': 'app/js/*.js'
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

                    while(true) {
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
        .pipe(gulp.dest('app/img/'));
    spriteData.css.pipe(gulp.dest('app/scss/_common'));
});

//Compass
gulp.task('compass', function() {
    gulp.src('app/scss/main.scss')
        .pipe(pl.plumber())
        .pipe(pl.compass({
            config_file: 'config.rb',
            css: 'app/css',
            sass: 'app/scss',
            sourcemap: true
        }));
});

//Concat
gulp.task('concat', function(){
    return gulp.src(paths.css)
        .pipe(pl.plumber())
        .pipe(pl.concatCss('main.css'))
        .pipe(gulp.dest('app/css'));
});

//Prefix
gulp.task('prefix', function(){
    return gulp.src(paths.css)
        .pipe(pl.plumber())
        .pipe(pl.autoPrefix({
            browsers: ['> 1%', 'IE 8'],
            cascade: false
        }))
        .pipe(gulp.dest('app/css'));
});

//Jade
gulp.task('jade', function(){
    return gulp.src(paths.jade)
        .pipe(pl.plumber())
        .pipe(pl.jade({
            pretty: true
        }))
        .pipe(gulp.dest('app/'));
});

//Server
gulp.task('server', function(){
    browserSync({
        port: 9000,
        server: {
            baseDir: 'app'
        }
    });
});

//Watch
gulp.task('watch', function(){
    gulp.watch('app/markups/**/*.jade', ['jade']);
    gulp.watch('app/scss/**/*.scss', ['compass']);
    gulp.watch([
        paths.html,
        paths.js,
        paths.css
    ]).on('change', browserSync.reload);
});

//Default
gulp.task('default', ['server', 'jade', 'compass', 'watch']);