'use strict'

moviesServices.factory('SettingsFactory', ['LowDBFactory',
  function(LowDBFactory) {

    return {
      conf: LowDBFactory('settings.json')
    }

  }
])
