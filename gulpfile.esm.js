/*jshint esversion: 6 */

import gulp from 'gulp';
import browserSync from 'browser-sync';
import cp from 'child_process';

import jest from 'gulp-jest';

//SASS
import sass from "gulp-sass";
// Post CSS and Plugins
// import postcss from "gulp-postcss";
// import autoprefixer from "gulp-autoprefixer";

const server = browserSync.create();

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({ server: {} });
  done();
}

// https://publishing-project.rivendellweb.net/migrating-projects-to-gulp-4-0-and-es6/
// https://gist.github.com/townivan/9dd4e55ab19f6eca5be8066e0da58bf5

const myGlobs = {
  scssSource: './sass/**/*.scss',
  cssDest: './css',
  htmlSource: './*.html',
};

export function compileSass() {
  // enables 'gulp compileSass' from the terminal
  return gulp
    .src(myGlobs.scssSource) // make a stream of files to compile
    .pipe(sass()) // use the gulp-sass plugin on each file in the stream
    .pipe(gulp.dest(myGlobs.cssDest)); // save the compiled files
}

const runJest = () => {
  cp.process.env.NODE_ENV = 'test';
  return gulp
    .src("tests/**/*test.js")
    .pipe(jest({
      "preprocessorIgnorePatterns": [
        "<rootDir>/dist/", "<rootDir>/node_modules/"
      ],
      "automock": false
    }));
};

const watch = () => {
  // "./rawdata/**/*.bmp", 
  gulp.watch(["*.html", "./css/*.css", "main.js", "./modules/**/*.js", "./images/**/*", "app.json"], reload);
  gulp.watch(myGlobs.scssSource, compileSass);
};

const test = () => {
  gulp.watch(["tests/**/*test.js", "main.js", "./modules/**/*.js"], runJest);
};

const dev = gulp.series(serve, watch);
dev.description = 'Start server and use browsersync to watch files and update pages.';

// export { dev, test };
exports.test = test;
exports.default = dev;
