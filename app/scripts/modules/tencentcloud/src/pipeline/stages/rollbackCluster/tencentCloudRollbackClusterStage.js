'use strict';

const angular = require('angular');
import { RollbackClusterStage } from './RollbackClusterStage';

import { Registry } from '@spinnaker/core';

export const TENCENTCLOUD_PIPELINE_STAGES_ROLLBACKCLUSTER =
  'spinnaker.tencentcloud.pipeline.stage.rollbackClusterStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_ROLLBACKCLUSTER, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'rollbackCluster',
    cloudProvider: 'tencentcloud',
    component: RollbackClusterStage,
    validators: [
      { type: 'requiredField', fieldName: 'cluster' },
      { type: 'requiredField', fieldName: 'regions' },
      { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
    ],
  });
});
