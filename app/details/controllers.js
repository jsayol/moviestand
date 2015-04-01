'use strict'

/* Controllers */

moviesControllers.controller('MovieDetailCtrl', ['$scope', '$routeParams', 'DBFactory', 'HTTPStreamerFactory', 'MoviesView', '$timeout',
  function($scope, $routeParams, DBFactory, HTTPStreamerFactory, MoviesView, $timeout) {
    var gui = require('nw.gui')
    var win = gui.Window.get()

    $scope.movie = DBFactory.movies.find({fileName: $routeParams.movieId})
    $scope.movieInfo = DBFactory.tmdb.find({id: $scope.movie.tmdbid})
    $scope.view = MoviesView

    $('.background-loader').on('load', function(e) {
      $(this).remove()
      $('.backdrop')
        .css('background-image', 'url('+this.src+')')
        .addClass('loaded')
    })

    $('.poster').on('load', function(e) {
      $(this).addClass('loaded').delay(10).css('visibility', 'visible')
      // $(this).css('visibility', 'visible')
    })

    // $timeout(function() { $('[data-toggle="tooltip"]').tooltip() }, 1000)

    $scope.goback = function() {
      window.history.back()
    }

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

    $scope.play = function(internally) {
      if (internally) {
        var stream = HTTPStreamerFactory.addFile($scope.movie.path)
        var video = $('<video />')
          .attr({
            id:"videoplayer",
            src: stream,
            controls: true,
            autoplay: "autoplay",
            preload: "auto",
            width:"100%",
            height:"100%"
          })
          .addClass("video-js vjs-default-skin vjs-big-play-centered")

        $('.videoembed').append(video)
        $('.videoembed').show()

        videojs(
          'videoplayer',
          {
            techOrder: ["html5", "flash"],
          },
          function() {
            // this.play()
            this.on("ended", $scope.closevideo);


            // What follows is a series of ugly hack to avoid conflicts betweens
            // the app's and the player's fullscreen modes. It might not
            // always work.

            this.on("fullscreenchange", function() {
              var player = videojs('videoplayer')

              if (!$scope.view.isFullscreen && player._am_restoreFullscreen) {
                console.log('Restoring previous app fullscreen')
                $scope.view.toggleFullscreen()
              }

              delete player._am_restoreFullscreen
            });


            var children = videojs('videoplayer').children()
            var component = null
            for (var i=0, len=children.length; i<len && !component; i++) {
              component = children[i].fullscreenToggle
            }

            if (component) {
              component.on("mouseup", function() {
                if (!videojs('videoplayer').isFullscreen() && $scope.view.isFullscreen) {
                  console.log('Exiting app fullscreen before entering player fullscreen')
                  $scope.view.toggleFullscreen()
                  setTimeout(function() { videojs('videoplayer')._am_restoreFullscreen = true }, 500)
                }
              })
            }

            // END of ugly hacks
          }
        )
      }
      else {
        gui.Shell.openItem($scope.movie.path)
      }
    }

    $scope.watchtrailer = function(source) {
      if (typeof source == 'undefined')
        source = $scope.movieInfo.trailers.youtube[0].source

      var video = $('<video />')
        .attr({
          id:"videoplayer",
          src:"",
          width:"100%",
          height:"100%"
        })
        .addClass("video-js vjs-default-skin vjs-big-play-centered")

      $('.videoembed').append(video)
      $('.videoembed').show()

      videojs(
        'videoplayer',
        {
          techOrder: ["youtube"],
          ytcontrols: true,
          controls: true,
          autoplay: "autoplay",
          preload: "auto",
          src: "http://www.youtube.com/watch?v="+source
          // src: "http://www.youtube.com/watch?v="+source+'&origin=app://host/app/index.html'
        },
        function() {
          // this.play()
          this.on("ended", $scope.closevideo);
        }
      )

    }

    $scope.closevideo = function() {
      // videojs('videoplayer').pause()
      videojs('videoplayer').dispose()
      $('.videoembed').hide()
    }

    $scope.gotoimdb = function() {
      gui.Shell.openExternal('http://www.imdb.com/title/' + $scope.movieInfo.imdb_id)
    }

    $scope.open = function() {
      gui.Shell.showItemInFolder($scope.movie.path)
    }
  }
])

moviesControllers.directive('starRating', function () {
    return {
        restrict: 'A',
        template: '<ul class="rating">' +
            '<li ng-repeat="star in stars" ng-class="star">' +
            '\u2605' +
            '</li>' +
            '</ul>',
        scope: {
            starRatingValue: '=',
            starRatingMax: '='
        },
        link: function (scope, elem, attrs) {
          var value = Math.round(scope.starRatingValue)
          scope.stars = [];
          for (var i = 0; i < scope.starRatingMax; i++) {
            scope.stars.push({
              filled: i < value
            });
          }
        }
    }
});
