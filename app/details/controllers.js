'use strict'

/* Controllers */

moviesControllers.controller('MovieDetailCtrl', ['$scope', '$routeParams', 'DBFactory', 'HTTPStreamerFactory', '$timeout',
  function($scope, $routeParams, DBFactory, HTTPStreamerFactory, $timeout) {
    var gui = require('nw.gui')

    $scope.movie = DBFactory.movies.find({fileName: $routeParams.movieId})
    $scope.movieInfo = DBFactory.tmdb.find({id: $scope.movie.tmdbid})

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
        console.log(stream)
        var video = $('<video />')
          .attr({
            id:"videoplayer",
            // src: 'http://127.0.0.1:1337/'+encodeURI($scope.movie.path),
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

        // videojs.options.flash.swf = "../lib/video-js/video-js.swf"

        videojs(
          'videoplayer',
          {
            techOrder: ["html5", "flash"],
          },
          function() {
            // var player = this
            // player.load().play()
            this.play()
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

      // videojs.options.flash.swf = "../lib/video-js/video-js.swf"

      videojs(
        'videoplayer',
        {
          techOrder: ["youtube"],
          ytcontrols: false,
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
