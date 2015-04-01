moviesServices.factory('FilterFactory', ['DBFactory',
  function(DBFactory) {

    return {
      genre: null,

      country: null,

      query: '',

      genres: function() {
        return DBFactory.movies
          .chain()
          .pluck('genres')
          .flatten()
          .compact()
          .uniq(function(n) { return n.id })
          .value()
      },

      countries: function() {
        return DBFactory.movies
          .chain()
          .pluck('production_countries')
          .flatten()
          .compact()
          .uniq(function(n) { return n.iso_3166_1 })
          .value()
      }
    }
  }
])

moviesApp.filter('movieFilter', function() {
    return function(movies, genre, country) {
      if (!genre && !country) {
        return movies
      }
      else {
        return movies.filter(function(movie) {
          var hasGenre = !genre
          var hasCountry = !country

          if (movie.genres && !hasGenre) {
            for (var i=0, len=movie.genres.length; i<len && !hasGenre; i++) {
              hasGenre = (movie.genres[i].id == genre)
            }
          }

          if (movie.production_countries && !hasCountry) {
            for (var i=0, len=movie.production_countries.length; i<len && !hasCountry; i++) {
              hasCountry = (movie.production_countries[i].iso_3166_1 == country)
            }
          }

          return hasGenre && hasCountry
        })
      }
    }
})
