const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const replace = require('gulp-replace');
const imagemin = require('gulp-imagemin');

// Limpar a pasta dist
gulp.task('clean', () => {
    return del(['dist/**', '!dist']);
});

// Minificar HTML
gulp.task('html', () => {
    return gulp.src(['*.html', '!node_modules/**'])
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest('dist'));
});

// Minificar CSS
gulp.task('css', () => {
    return gulp.src(['css/**/*.css', '!node_modules/**'])
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'));
});

// Minificar e ofuscar JS
gulp.task('js', () => {
    return gulp.src(['js/**/*.js', '!node_modules/**'])
        .pipe(uglify({
            mangle: {
                toplevel: true,
                reserved: ['Amplify', 'Auth', 'aws_amplify', 'awsConfig'] // Preservar nomes importantes
            }
        }))
        .pipe(gulp.dest('dist/js'));
});

// Otimizar imagens
gulp.task('images', () => {
    return gulp.src(['images/**/*', '!node_modules/**'])
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'));
});

// Copiar arquivos AWS Amplify
gulp.task('aws', () => {
    return gulp.src([
        'node_modules/@aws-amplify/**/*',
    ])
    .pipe(gulp.dest('dist/node_modules/@aws-amplify'));
});

// Copiar outros arquivos necessários
gulp.task('copy', () => {
    return gulp.src([
        'favicon.ico',
        'robots.txt',
        '*.png',
        '*.json',
        'css/**/*',
        'js/**/*',
        'images/**/*',
        '!node_modules/**',
        '!package*.json',
        '!gulpfile.js'
    ], { allowEmpty: true })
        .pipe(gulp.dest('dist'));
});

// Tarefa de build completa
gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('html', 'css', 'js', 'images', 'aws', 'copy')
));
