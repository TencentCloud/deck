'use strict';

const angular = require('angular');
import { ShrinkClusterStage } from './ShrinkClusterStage';

import { Registry } from '@spinnaker/core';

export const TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER_TENCENTCLOUDSHRINKCLUSTERSTAGE =
  'spinnaker.tencentcloud.pipeline.stage.tencentCloud.shrinkClusterStage';
export const name = TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER_TENCENTCLOUDSHRINKCLUSTERSTAGE; // for backwards compatibility
angular.module(TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER_TENCENTCLOUDSHRINKCLUSTERSTAGE, []).config(function() {
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
