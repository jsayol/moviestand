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

    var settingsDB = LowDBFactory('settings.json')

    var ret = {
      query: function() {
        return settingsDB('settings').value()
      },

      sanitation: function(settings) {
        $.extend(true, settings, defaults)
        this.save()
        return settings
      },

      save: function() {
        settingsDB.save()
      }
    }

    ret.sanitation(ret.query())

    return ret
  }
])
