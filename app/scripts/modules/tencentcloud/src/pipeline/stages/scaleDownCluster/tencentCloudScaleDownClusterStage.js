'use strict';

const angular = require('angular');
import { ScaleDownClusterStage } from './ScaleDownClusterStage';

import { Registry } from '@spinnaker/core';

export const TENCENT_PIPELINE_STAGES_SCALEDOWNCLUSTER_TENCENTCLOUDSCALEDOWNCLUSTERSTAGE =
  'spinnaker.tencent.pipeline.stage.scaleDownClusterStage';
export const name = TENCENT_PIPELINE_STAGES_SCALEDOWNCLUSTER_TENCENTCLOUDSCALEDOWNCLUSTERSTAGE; // for backwards compatibility
angular.module(TENCENT_PIPELINE_STAGES_SCALEDOWNCLUSTER_TENCENTCLOUDSCALEDOWNCLUSTERSTAGE, []).config(function() {
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
