'use strict'

moviesServices.factory('SettingsFactory', ['LowDBFactory',
  function(LowDBFactory) {
    var defaults = {
      view: {
        mode: 'grid'
      },
      play: {
        player: 'default'
      },
      trailers: {
        show: true,
        quality: 'auto'
      }
    }

    var ret = {
      db: LowDBFactory(LowDBFactory._userDataDir + 'settings.json'),

      set: function(section, prop, value) {
        var obj = this.db('settings').value()[0]
        if (!obj[section]) {
          obj[section] = {}
        }
        obj[section][prop] = value
        this.db.save()
        return this
      },

      get: function(section, prop) {
        return this.db('settings').value()[0][section][prop]
      },

      query: function() {
        return this.db('settings').value()
      },

      sanitation: function() {
        $.extend(true, this.query()[0], defaults)
        this.save()
        return this
      },

      save: function() {
        this.db.save()
      }
    }

    if (ret.query().length == 0) {
      ret.db('settings').push({})
    }

    return ret.sanitation()
  }
])
