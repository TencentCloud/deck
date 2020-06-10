'use strict';

const angular = require('angular');
import { Registry } from '@spinnaker/core';
import { ScaleDownClusterStage } from './ScaleDownClusterStage';

export const TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWNCLUSTER =
  'spinnaker.tencentcloud.pipeline.stage.scaleDownClusterStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWNCLUSTER, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'scaleDownCluster',
    cloudProvider: 'tencentcloud',
    component: ScaleDownClusterStage,
    accountExtractor: stage => [stage.context.credentials],
    configAccountExtractor: stage => [stage.credentials],
    validators: [
      { type: 'requiredField', fieldName: 'cluster' },
      {
        type: 'requiredField',
        fieldName: 'remainingFullSizeServerGroups',
        fieldLabel: 'Keep [X] full size Server Groups',
      },
      { type: 'requiredField', fieldName: 'regions' },
      { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
    ],
    strategy: true,
  });
});
