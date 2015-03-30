'use strict'

/* Controllers */

moviesControllers.controller('MovieDetailCtrl', ['$scope', '$routeParams', 'DBFactory', '$timeout',
  function($scope, $routeParams, DBFactory, $timeout) {
    var gui = require('nw.gui')

    $scope.movie = DBFactory.movies.find({fileName: $routeParams.movieId})
    $scope.movieInfo = DBFactory.tmdb.find({id: $scope.movie.tmdbid})

    $('.img-loader').on('load', function(e) {
      $(this).remove()
      $('.backdrop')
        .css('background-image', 'url('+this.src+')')
        .addClass('loaded')
    })

    // $timeout(function() { $('[data-toggle="tooltip"]').tooltip() }, 1000)


    $scope.countries = function() {
      return $scope.movieInfo.production_countries
        .map(function (c) { return c['name'] })
        .join(' / ')
    }

    $scope.genres = function() {
      return $scope.movieInfo.genres
        .map(function (c) { return c['name'] })
        .join(' / ')
    }

    $scope.play = function() {
      gui.Shell.openItem($scope.movie.path)
    }

    $scope.watchtrailer = function(source) {
      if (typeof source == 'undefined')
        source = $scope.movieInfo.trailers.youtube[0].source

      // gui.Shell.openExternal('http://www.youtube.com/watch?v='+source)

      $('.trailerembed').show()

      // $('#ytplayer').attr('src', 'http://www.youtube.com/embed/' + source +
      //   '?autoplay=1&origin=app://host/app/index.html')

      var video = $('<video />')
        .attr({
          id:"ytplayer",
          src:"",
          width:"100%",
          height:"100%"
        })
        .addClass("video-js vjs-default-skin vjs-big-play-centered")

      $('.trailerembed').append(video)
      //
      // videojs.options.flash.swf = "../lib/video-js/video-js.swf"

      videojs(
        'ytplayer',
        {
          techOrder: ["youtube"],
          ytcontrols: false,
          controls: true,
          // autoplay: true,
          autoplay: "autoplay",
          preload: "auto",
          src: "http://www.youtube.com/watch?v="+source
          // src: "http://www.youtube.com/watch?v="+source+'&origin=app://host/app/index.html'
          // src: "http://www.youtube.com/embed/"+source+'&autoplay=1&origin=app://host/app/index.html'
        },
        function() {
          var player = this
          // player.load().play()
          // player.play()
        }
      )

    }

    $scope.closetrailer = function() {
      // if (typeof source == 'undefined')
      //   source = $scope.movieInfo.trailers.youtube[0].source
      //
      // gui.Shell.openExternal('http://www.youtube.com/watch?v='+source)

      videojs('ytplayer').dispose()
      // videojs('ytplayer').pause()
      $('.trailerembed').hide()
    }

  }
])
