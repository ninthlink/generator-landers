// generated on <%= date %> using <%= name %> <%= version %>
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const wiredep = require('wiredep').stream;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var customPort = 9000;

gulp.task('styles', () => {<% if (includeSass) { %>
  return gulp.src('clients/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))<% } else { %>
  return gulp.src('clients/styles/*.css')
    .pipe($.sourcemaps.init())<% } %>
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

<% if (includeBabel) { -%>
gulp.task('scripts', () => {
  return gulp.src('clients/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});
<% } -%>

function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('clients/scripts/**/*.js', {
    fix: true
  })
    .pipe(gulp.dest('clients/scripts'));
});
gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js', {
    fix: true,
    env: {
<% if (testFramework === 'mocha') { -%>
      mocha: true
<% } else if (testFramework === 'jasmine') { -%>
      jasmine: true
<% } -%>
    }
  })
    .pipe(gulp.dest('test/spec/**/*.js'));
});

<% if (includeBabel) { -%>
gulp.task('html', ['styles', 'scripts'], () => {
<% } else { -%>
gulp.task('html', ['styles'], () => {
<% } -%>
  return gulp.src('clients/*.html') 
    .pipe($.useref({searchPath: ['.tmp', 'clients', '.']}))
    .pipe($.if('*.js', $.uglify()))
    <% if (includeUncss) { -%>
    .pipe($.if('*.css', $.uncss({
            html: ['clients/index.html'],
            ignore: [/\w\.in/,
                    '.fade',
                    '.collapse',
                    '.collapsing',
                    /(#|\.)navbar(\-[a-zA-Z]+)?/,
                    /(#|\.)dropdown(\-[a-zA-Z]+)?/,
                    /(#|\.)(open)/,
                    /(#|\.)carousel(\-[a-zA-Z]+)?/,
                    '.modal',
                    '.modal.fade.in',
                    '.modal-dialog',
                    '.modal-document',
                    '.modal-scrollbar-measure',
                    '.modal-backdrop.fade',
                    '.modal-backdrop.in',
                    '.modal.fade.modal-dialog',
                    '.modal.in.modal-dialog',
                    '.modal-open',
                    '.in',
                    '.modal-backdrop']
        })))
    <% } -%>
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false, discardComments: {removeAll: true}})))
    .pipe($.if('*.html', $.htmlmin({collapseBooleanAttributes: true, collapseWhitespace: true, removeComments: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('clients/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('clients/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'clients/*.*',
    '!clients/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

<% if (includeBabel) { -%>
gulp.task('serve', ['styles', 'scripts', 'fonts'], () => {
<% } else { -%>
gulp.task('serve', ['styles', 'fonts'], () => {
<% } -%>
  browserSync({
    notify: false,
    port: customPort,
    server: {
      baseDir: ['.tmp', 'clients'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'clients/*.html',
<% if (!includeBabel) { -%>
    'clients/scripts/**/*.js',
<% } -%>
    'clients/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('clients/styles/**/*.<%= includeSass ? 'scss' : 'css' %>', ['styles']);
<% if (includeBabel) { -%>
  gulp.watch('clients/scripts/**/*.js', ['scripts']);
<% } -%>
  gulp.watch('clients/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: customPort,
    server: {
      baseDir: ['dist']
    }
  });
});

<% if (includeBabel) { -%>
gulp.task('serve:test', ['scripts'], () => {
<% } else { -%>
gulp.task('serve:test', () => {
<% } -%>
  browserSync({
    notify: false,
    port: customPort,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
<% if (includeBabel) { -%>
        '/scripts': '.tmp/scripts',
<% } else { -%>
        '/scripts': 'clients/scripts',
<% } -%>
        '/bower_components': 'bower_components'
      }
    }
  });

<% if (includeBabel) { -%>
  gulp.watch('clients/scripts/**/*.js', ['scripts']);
<% } -%>
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {<% if (includeSass) { %>
  gulp.src('clients/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('clients/styles'));
<% } %>
  gulp.src('clients/*.html')
    .pipe(wiredep({<% if (includeBootstrap) { if (includeSass) { %>
      exclude: ['bootstrap-sass'],<% } else { %>
      exclude: ['bootstrap.js'],<% }} %>
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('clients'));
});

gulp.task('bootlint', function() {
    return gulp.src('clients/index.html')
        .pipe($.bootlint({
            reportFn: function(file, lint, isError, isWarning, errorLocation) {
                var message = (isError) ? "ERROR! - " : "WARN! - ";
                if (errorLocation) {
                    message += ' (line:' + (errorLocation.line + 1) + ', col:' + (errorLocation.column + 1) + ') [' + lint.id + '] ' + lint.message;
                } else {
                    message += ': ' + lint.id + ' ' + lint.message;
                }
                console.log(message);
            }
        }));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
