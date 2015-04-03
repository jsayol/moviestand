moviesServices.factory('FilterFactory', ['DBFactory',
  function(DBFactory) {

    return {
      genre: null,
      country: null,
      query: ''
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
          var i, len

          if (movie.genres && !hasGenre) {
            for (i=0, len=movie.genres.length; i<len && !hasGenre; i++) {
              hasGenre = (movie.genres[i].id === genre)
            }
          }

          if (movie.production_countries && !hasCountry) {
            for (i=0, len=movie.production_countries.length; i<len && !hasCountry; i++) {
              hasCountry = (movie.production_countries[i].iso_3166_1 === country)
            }
          }

          return hasGenre && hasCountry
        })
      }
    }
})
