'use strict';

const angular = require('angular');
import { Registry } from '@spinnaker/core';
import { ScaleDownCluster } from './ScaleDownCluster';

export const TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWN_CLUSTER =
  'spinnaker.tencentcloud.pipeline.stage.scaleDownClusterStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWN_CLUSTER, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'scaleDownCluster',
    cloudProvider: 'tencentcloud',
    component: ScaleDownCluster,
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
