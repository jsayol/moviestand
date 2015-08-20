'use strict'

/* Controllers */

moviesControllers.controller('SettingsCtrl', ['$scope', '$rootScope', '$state', '_',
  function($scope, $rootScope, $state, _) {
    $scope.entries = [
      {
        name     : 'Collections',
        state    : 'settings.collections',
        disabled : false,
        icon     : 'film'
      },
      {
        name     : 'Settings',
        state    : 'settings.general',
        disabled : true,
        icon     : 'cog'
      },
      {
        name     : 'Themes',
        state    : 'settings.themes',
        disabled : true,
        icon     : 'tint'
      },
      {
        name     : 'About',
        state    : 'settings.about',
        disabled : true,
        icon     : 'info-sign'
      }
    ]


    $rootScope.$on('$stateChangeStart', function(event, toState) {
      var entry = _.find($scope.entries, {state: toState.name})
      if (entry && entry.disabled) {
        event.preventDefault()
      }
    })
  }
])

moviesControllers.controller('SettingsSettingsCtrl', ['$scope', 'SettingsFactory',
  function($scope, $stateParams, SettingsFactory) {

  }
])

moviesControllers.controller('SettingsCollectionsCtrl', ['$scope', '$state', 'CollectionsFactory',
  function($scope, $state, CollectionsFactory) {
    $scope.collections = CollectionsFactory

    $scope.newCollection = function() {
      var newCollection = CollectionsFactory.createNew()
      $state.go('settings.collections.details', {id: newCollection.id})
    }

    $scope.removeCollection = function(collection) {
      var dialog = $('.modal-remove-collection')
      dialog.find('.name').text(collection.name)
      dialog.find('.remove-button').on('click', function() {
        CollectionsFactory.removeCollection(collection)
        dialog.modal('hide')

        if ($state.includes('settings.collections.details', {id: collection.id})) {
          $state.go('settings.collections')
        }

        $scope.$apply()
      })
      dialog.modal()
    }

  }
])

moviesControllers.controller('SettingsThemesCtrl', ['$scope', 'SettingsFactory',
  function($scope, SettingsFactory) {

  }
])

moviesControllers.controller('SettingsAboutCtrl', ['$scope', 'SettingsFactory',
  function($scope, SettingsFactory) {

  }
])

moviesControllers.controller('SettingsCollectionDetailsCtrl', ['$scope', '$stateParams', 'CollectionsFactory',
  function($scope, $stateParams, CollectionsFactory) {
    $scope.id = $stateParams.id
    $scope.collection = CollectionsFactory.db.find({id: $scope.id})

    // Let's perform some sanitation on the collection before presenting it
    CollectionsFactory.sanitation($scope.collection)

    $('.collectionfolder').on('click', function() {
      // $('.folderselector').click()
      var dialog = require('remote').require('dialog');
      this.value = dialog.showOpenDialog({properties: ['openDirectory'], defaultPath: $scope.collection.folders[0].path})
      $scope.collection.folders[0].path = this.value
      $scope.$apply()
    })

  }
])
