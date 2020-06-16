'use strict';

const angular = require('angular');
import { Registry } from '@spinnaker/core';
import { ShrinkClusterStage } from './ShrinkClusterStage';

export const TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER =
  'spinnaker.tencentcloud.pipeline.stage.tencentcloud.shrinkClusterStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'shrinkCluster',
    cloudProvider: 'tencentcloud',
    component: ShrinkClusterStage,
    accountExtractor: stage => [stage.context.credentials],
    configAccountExtractor: stage => [stage.credentials],
    validators: [
      { type: 'requiredField', fieldName: 'cluster' },
      { type: 'requiredField', fieldName: 'shrinkToSize', fieldLabel: 'shrink to [X] Server Groups' },
      { type: 'requiredField', fieldName: 'regions' },
      { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
    ],
  });
});
