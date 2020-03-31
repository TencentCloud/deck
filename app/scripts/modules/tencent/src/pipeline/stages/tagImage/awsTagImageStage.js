'use strict';

const angular = require('angular');

import { Registry, PipelineConfigService, StageConstants } from '@spinnaker/core';

export const TENCENT_PIPELINE_STAGES_TAGIMAGE_AWSTAGIMAGESTAGE = 'spinnaker.tencent.pipeline.stage.tagImageStage';
export const name = TENCENT_PIPELINE_STAGES_TAGIMAGE_AWSTAGIMAGESTAGE; // for backwards compatibility
angular
  .module(TENCENT_PIPELINE_STAGES_TAGIMAGE_AWSTAGIMAGESTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'upsertImageTags',
      cloudProvider: 'tencent',
      templateUrl: require('./tagImageStage.html'),
      executionDetailsUrl: require('./tagImageExecutionDetails.html'),
      executionConfigSections: ['tagImageConfig', 'taskStatus'],
    });
  })
  .controller('tencentTagImageStageCtrl', [
    '$scope',
    $scope => {
      $scope.stage.tags = $scope.stage.tags || {};
      $scope.stage.cloudProvider = $scope.stage.cloudProvider || 'tencent';

      const initUpstreamStages = () => {
        const upstreamDependencies = PipelineConfigService.getAllUpstreamDependencies(
          $scope.pipeline,
          $scope.stage,
        ).filter(stage => StageConstants.IMAGE_PRODUCING_STAGES.includes(stage.type));
        $scope.consideredStages = new Map(upstreamDependencies.map(stage => [stage.refId, stage.name]));
      };
      $scope.$watch('stage.requisiteStageRefIds', initUpstreamStages);
    },
  ]);
