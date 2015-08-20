'use strict'

/* Controllers */

moviesControllers.controller('MovieDetailCtrl', ['$scope', '$stateParams', 'DBFactory', 'CollectionsFactory', 'StreamingFactory', 'MoviesView', '$timeout',
  function($scope, $stateParams, DBFactory, CollectionsFactory, StreamingFactory, MoviesView, $timeout) {
    $scope.movieHash = $stateParams.movieHash
    $scope.movie = CollectionsFactory.db
      .chain()
      .pluck('folders')
      .flatten()
      .pluck('files')
      .flatten()
      .find({hash: $scope.movieHash})
      .value()
    $scope.movieInfo = DBFactory.tmdb.find({id: $scope.movie.tmdbid})
    $scope.view = MoviesView

    $('.background-loader').on('load', function(e) {
      var self = $(this)
      self.remove()
      $('#backdrop-'+self.attr('data-hash'))
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
        var video = $('<video />')
          .attr({
            id:"videoplayer",
            src: StreamingFactory.addFile($scope.movie.path),
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
            this.on("ended", $scope.closevideo)
          }
        )
      }
      else {
        $scope.view.shell.openItem($scope.movie.path)
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
      $scope.view.shell.openExternal('http://www.imdb.com/title/' + $scope.movieInfo.imdb_id)
    }

    $scope.open = function() {
      $scope.view.shell.showItemInFolder($scope.movie.path)
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
