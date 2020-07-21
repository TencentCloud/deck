'use strict';

const angular = require('angular');
import { Registry } from '@spinnaker/core';
import { ShrinkCluster } from './ShrinkCluster';

export const TENCENTCLOUD_PIPELINE_STAGES_SHRINK_CLUSTER =
  'spinnaker.tencentcloud.pipeline.stage.tencentcloud.shrinkClusterStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_SHRINK_CLUSTER, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'shrinkCluster',
    cloudProvider: 'tencentcloud',
    component: ShrinkCluster,
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
