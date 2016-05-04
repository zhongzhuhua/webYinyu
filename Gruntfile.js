module.exports = function(grunt) {
  var mozjpeg = require('imagemin-mozjpeg');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // ============== 文件合并  ===============
    concat: {
      // 合并公用 css
      commonCss: {
        src: ['assets/lib/layer.mobile/layer/need/layer.css', 'assets/css/global.css', 'assets/css/layout.css', 'assets/css/dev.css'],
        dest: 'assets/css/common.css'
      },
      // 合并插件 js
      libJs: {
        src: ['assets/lib/require.js', 'assets/lib/require.config.js', 'assets/lib/ice.js', 'assets/lib/ice.scrollY.js'],
        dest: 'dist/assets/js/common.js'
      }
    },

    // ============== css 压缩  ===============
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      // 压缩公用 css
      commonCss: {
        src: 'assets/css/common.css',
        dest: 'dist/assets/css/common.css'
      }
    },

    // ============== js 压缩  ===============
    uglify: {
      options: {
        mangle: {
          except: ['define', 'require', 'module', 'exports']
        },
        compress: false,
        stripBanners: true
      },
      build: {
        files: [{
          expand: true,
          cwd: 'dist/assets/js/',
          src: ['common.js'],
          dest: 'dist/assets/js/',
          extDot: '',
          ext: '.js'
        }, {
          expand: true,
          cwd: 'assets/js/',
          src: ['*/*.js'],
          dest: 'dist/assets/js/',
          extDot: '',
          ext: '.js'
        }]
      }
    },

    // =============== 合并 html =============
    includereplace: {
      meta: {
        options: {

        },
        src: 'html/**/*.html',
        dest: 'dist/'
      }
    },

    // =============== 插件复制 =============
    copy: {
      main: {
        files: [{
          expand: true,
          src: ['assets/lib/*/**'],
          dest: 'dist/'
        }, {
          expand: true,
          src: ['favicon.icon'],
          dest: 'dist/'
        }]
      },
      app: {
        files: [{
          expand: true,
          src: ['app/**', 'wechat/**'],
          dest: 'dist/'
        }]
      }
    },

    // ============== html 压缩 =============
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: 'dist/html',
          src: '**/*.html',
          dest: 'dist/html'
        }]
      }
    },

    // ============== 图片压缩 =============
    imagemin: {
      main: {
        options: {
          //定义 jpg png 图片优化水平
          optimizationLevel: 4,
          pngquant: true,
          svgoPlugins: [{
            removeViewBox: false
          }],
          use: [mozjpeg()]
        },
        files: [{
          expand: true,
          cwd: 'assets/images',
          src: ['**/*.{png,jpg,jpeg}'],
          dest: 'dist/assets/images'
        }]
      }
    },

    // ============== 监控 =================
    watch: {
      options: {
        // 1s 执行，默认 500ms
        debounceDelay: 1000
      },
      app: {
        files: ['app/**', 'wechat/**'],
        tasks: ['copy:app']
      },
      lib: {
        files: ['assets/lib/*.js', 'assets/lib/*/*.js'],
        tasks: ['concat', 'libs', 'jsmin']
      },
      scripts: {
        files: 'assets/js/**/*',
        tasks: ['uglify']
      },
      css: {
        files: 'assets/css/*.css',
        tasks: ['cssmini']
      },
      html: {
        files: ['html/**/*', 'modules/*'],
        tasks: ['html']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-include-replace');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('img', '图片压缩', function() {
    grunt.task.run(['imagemin']);
  });

  grunt.registerTask('libs', '复制插件', function() {
    grunt.task.run(['copy']);
  });

  grunt.registerTask('cssmini', '合并压缩样式', function() {
    grunt.task.run(['concat', 'cssmin']);
  });

  grunt.registerTask('jsmin', '合并压缩脚本', function() {
    grunt.task.run(['concat', 'uglify']);
  });

  grunt.registerTask('include', '合并页面', function() {
    grunt.task.run('includereplace');
  });

  grunt.registerTask('html', '压缩页面', function() {
    grunt.task.run(['include', 'htmlmin']);
  });

  grunt.registerTask('pack', '监控打包', function() {
    grunt.task.run(['watch']);
  });

  grunt.registerTask('default', '默认任务', function() {
    grunt.task.run(['concat', 'cssmin', 'uglify', 'includereplace'])
  });
};
