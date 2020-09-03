const {parallel, series, src, dest, watch} = require('gulp');
const ejs = require('gulp-ejs');
const sass = require('gulp-sass');
const del = require('del');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('cssnano');
const imagemin = require('gulp-imagemin');
const svgo = imagemin.svgo;
const webp = require('imagemin-webp');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const babelify = require('babelify');
const favicons = require('gulp-favicons');
const plumber = require('gulp-plumber');
const beep = require('beepbeep');
const critical = require('critical').stream;
const argv = require('minimist')(process.argv.slice(2));

const errorHandler = (error) => {
  beep();
  console.log(error.message.red);
};

const js = () => {
  return (
    browserify({
      entries: ['src/js/main.js'],
      transform: [babelify.configure({presets: ['@babel/preset-env']})]
    })
      .bundle()
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(dest('public'))
  );
};

const fonts = (cb) => {
  src('src/assets/fonts/**/*')
    .pipe(dest('public/fonts'));
  cb();
};

const compressCSS = (cb) => {
  src('public/css/*.css')
    .pipe(plumber({errorHandler}))
    .pipe(postcss([
      cssnano({
        zindex: false
      })
    ]))
    .pipe(dest('public/css'));
  cb();
};

const compressJS = (cb) => {
  src('public/bundle.js')
    .pipe(plumber({errorHandler}))
    .pipe(uglify())
    .pipe(dest('public'));
  cb();
};

const criticalCSS = (cb) => {
  src('public/*.html')
    .pipe(plumber({errorHandler}))
    .pipe(critical({
      base: 'public',
      inline: true,
      css: ['public/*.css']
    }))
    .pipe(dest('public'));
  cb();
};

const styles = (cb) => {
  src('src/scss/*.scss')
    .pipe(plumber({errorHandler}))
    .pipe(sourcemaps.init())
    .pipe(sass({includePaths: ['node_modules']}))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('public'))
    .pipe(browserSync.stream());
  cb();
};

const favicon = (cb) => {
  src('src/assets/favicon.png')
    .pipe(plumber({errorHandler}))
    .pipe(favicons({
      path: 'public/img/favicons',
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        coast: {
          offset: 25
        },
        favicons: true,
        firefox: false,
        windows: false,
        yandex: false
      }
    }))
    .pipe(dest('public/img/favicons'));
  cb();
};

const imagesWebp = (cb) => {
  src('src/assets/img/**/*')
    .pipe(plumber({errorHandler}))
    .pipe(newer('src/img/**/*'))
    .pipe(imagemin([
      webp({quality: 50})
    ]))
    .pipe(rename({extname: '.webp'}))
    .pipe(dest('public/img'));
  cb();
};

const images = (cb) => {
  src('src/assets/img/**/*')
    .pipe(plumber({errorHandler}))
    .pipe(newer('src/img/**/*'))
    .pipe(imagemin())
    .pipe(dest('public/img'));
  cb();
};

const svg = (cb) => {
  src('src/assets/icons/*.svg')
    .pipe(plumber({errorHandler}))
    .pipe(imagemin([
      svgo({
        plugins: [
          {removeAttrs: {attrs: 'fill'}},
        ]
      })
    ]))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../img/sprite'
        }
      }
    }))
    .pipe(dest('public'));
  cb();
};

const html = (cb) => {
  src('src/views/*.ejs')
    .pipe(plumber({errorHandler}))
    .pipe(ejs())
    .pipe(rename({extname: '.html'}))
    .pipe(dest('public'));
  cb();
};

const watcher = () => {
  watch('src/assets/img/**/*.+(jpg|jpeg|png', series(images, imagesWebp, reload));
  watch('src/assets/icons/*.svg', series(svg, reload));
  watch('src/assets/favicon.png', series(favicon, reload));
  watch('src/views/**/*.ejs', series(html, reload));
  watch('src/scss/**/*.scss', styles);
  watch('src/js/**/*.js', series(js, reload));
};

const reload = (cb) => {
  browserSync.reload();
  cb();
};

const clean = () => {
  return del(['public']);
};

const server = (cb) => {
  browserSync.init({
    open: false,
    notify: false,
    server: {
      baseDir: 'public',
    }
  });
  cb();
};

const build = series(
  clean,
  html,
  styles,
  images,
  imagesWebp,
  favicon,
  svg,
  js,
  fonts
);

if (argv.prod) {
  exports.build = series(build, compressCSS, compressJS, criticalCSS);
} else {
  exports.build = build;
}

exports.default = series(
  build,
  server,
  watcher
);