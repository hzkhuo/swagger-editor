'use strict';

PhonicsApp.controller('PreviewCtrl', [
  'Storage',
  'Builder',
  'FoldManager',
  '$scope',
  '$stateParams',
  'defaults',
  PreviewCtrl
]);

function PreviewCtrl(Storage, Builder, FoldManager, $scope, $stateParams, defaults) {
  function updateSpecs(latest) {
    if ($stateParams.path) {
      $scope.specs = { paths: Builder.getPath(latest, $stateParams.path) };
      $scope.isSinglePath = true;
    } else {
      $scope.specs = Builder.buildDocsWithObject(latest, { resolve: true }).specs;
    }
  }
  function updateError(latest) {
    $scope.error = latest;
  }

  Storage.addChangeListener('specs', updateSpecs);
  Storage.addChangeListener('error', updateError);

  var resource = defaults.useBackendForStorage ? 'yaml' : 'specs';
  Storage.load(resource).then(function (storedSpecs) {
    if (storedSpecs) {
      updateSpecs(storedSpecs);
    }
  });

  Storage.load('error').then(function (storedError) {
    if (storedError) {
      updateError(storedError);
    }
  });

  FoldManager.onFoldStatusChanged(function () {
    _.defer(function () { $scope.$apply(); });
  });
  $scope.toggle = FoldManager.toggleFold;
  $scope.isCollapsed = FoldManager.isFolded;

  // TODO: Move to a service
  $scope.getEditPath = function (pathName) {
    return '#/paths?path=' + window.encodeURIComponent(pathName);
  };

  $scope.responseCodeClassFor = function (code) {
    var result = 'default';
    switch (Math.floor(+code / 100)) {
      case 2:
        result = 'green';
        break;
      case 5:
        result = 'red';
        break;
      case 4:
        result = 'yellow';
        break;
      case 3:
        result = 'blue';
    }
    return result;
  };

  /*
  ** Determines if a key is a vendor extension key
  ** Vendor extensions always start with `x-`
  */
  $scope.isVendorExtension = function (key) {
    return key.substring(0, 2).toLowerCase() === 'x-';
  };

}
