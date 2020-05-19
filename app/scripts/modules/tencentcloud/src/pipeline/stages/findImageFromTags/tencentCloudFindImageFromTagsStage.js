'use strict';

const angular = require('angular');

import { BakeryReader, Registry } from '@spinnaker/core';

export const TENCENTCLOUD_PIPELINE_STAGES_FINDIMAGEFROMTAGS_TENCENTCLOUDFINDIMAGEFROMTAGSSTAGE =
  'spinnaker.tencentcloud.pipeline.stage.findImageFromTagsStage';
angular
  .module(TENCENTCLOUD_PIPELINE_STAGES_FINDIMAGEFROMTAGS_TENCENTCLOUDFINDIMAGEFROMTAGSSTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'findImageFromTags',
      cloudProvider: 'tencentcloud',
      templateUrl: require('./findImageFromTagsStage.html'),
      executionDetailsUrl: require('./findImageFromTagsExecutionDetails.html'),
      executionConfigSections: ['findImageConfig', 'taskStatus'],
      validators: [
        {
          type: 'requiredField',
          fieldName: 'packageName',
        },
        {
          type: 'requiredField',
          fieldName: 'regions',
        },
        {
          type: 'requiredField',
          fieldName: 'tags',
        },
      ],
    });
  })
  .controller('tencentCloudFindImageFromTagsStageCtrl', [
    '$scope',
    function($scope) {
      $scope.stage.tags = $scope.stage.tags || {};
      $scope.stage.regions = $scope.stage.regions || [];
      $scope.stage.cloudProvider = $scope.stage.cloudProvider || 'tencentcloud';

      BakeryReader.getRegions('tencentcloud').then(function(regions) {
        $scope.regions = regions;
      });
    },
  ]);
