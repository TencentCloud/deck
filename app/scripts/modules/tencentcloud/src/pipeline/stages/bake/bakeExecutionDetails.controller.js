'use strict';

const angular = require('angular');
import { get } from 'lodash';

import { SETTINGS } from '@spinnaker/core';
import { default as UIROUTER_ANGULARJS } from '@uirouter/angularjs';

export const TENCENTCLOUD_PIPELINE_STAGES_BAKE_BAKEEXECUTIONDETAILS_CONTROLLER =
  'spinnaker.tencentcloud.pipeline.stage.bake.executionDetails.controller';
angular
  .module(TENCENTCLOUD_PIPELINE_STAGES_BAKE_BAKEEXECUTIONDETAILS_CONTROLLER, [UIROUTER_ANGULARJS])
  .controller('tencentCloudBakeExecutionDetailsCtrl', [
    '$scope',
    '$stateParams',
    'executionDetailsSectionService',
    '$interpolate',
    function($scope, $stateParams, executionDetailsSectionService, $interpolate) {
      $scope.configSections = ['bakeConfig', 'taskStatus'];

      const initialized = () => {
        $scope.detailsSection = $stateParams.details;
        $scope.provider = $scope.stage.context.cloudProviderType || 'tencentcloud';
        $scope.roscoMode = SETTINGS.feature.roscoMode;
        $scope.bakeryDetailUrl = $interpolate(SETTINGS.bakeryDetailUrl);
        $scope.bakeFailedNoError =
          get($scope.stage, 'context.status.result') === 'FAILURE' && !$scope.stage.failureMessage;
      };

      const initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

      initialize();

      $scope.$on('$stateChangeSuccess', initialize);
    },
  ]);
