'use strict';

const angular = require('angular');

import { BakeryReader, Registry } from '@spinnaker/core';

export const TENCENT_PIPELINE_STAGES_FINDIMAGEFROMTAGS_AWSFINDIMAGEFROMTAGSSTAGE =
  'spinnaker.tencent.pipeline.stage.findImageFromTagsStage';
export const name = TENCENT_PIPELINE_STAGES_FINDIMAGEFROMTAGS_AWSFINDIMAGEFROMTAGSSTAGE; // for backwards compatibility
angular
  .module(TENCENT_PIPELINE_STAGES_FINDIMAGEFROMTAGS_AWSFINDIMAGEFROMTAGSSTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'findImageFromTags',
      cloudProvider: 'tencent',
      templateUrl: require('./findImageFromTagsStage.html'),
      executionDetailsUrl: require('./findImageFromTagsExecutionDetails.html'),
      executionConfigSections: ['findImageConfig', 'taskStatus'],
      validators: [
        { type: 'requiredField', fieldName: 'packageName' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'tags' },
      ],
    });
  })
  .controller('tencentFindImageFromTagsStageCtrl', [
    '$scope',
    function($scope) {
      $scope.stage.tags = $scope.stage.tags || {};
      $scope.stage.regions = $scope.stage.regions || [];
      $scope.stage.cloudProvider = $scope.stage.cloudProvider || 'tencent';

      BakeryReader.getRegions('tencent').then(function(regions) {
        $scope.regions = regions;
      });
    },
  ]);
