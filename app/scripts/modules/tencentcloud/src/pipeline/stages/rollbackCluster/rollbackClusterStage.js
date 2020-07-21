'use strict';

const angular = require('angular');
import { RollbackCluster } from './RollbackCluster';

import { Registry } from '@spinnaker/core';

export const TENCENTCLOUD_PIPELINE_STAGES_ROLLBACK_CLUSTER =
  'spinnaker.tencentcloud.pipeline.stage.rollbackClusterStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_ROLLBACK_CLUSTER, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'rollbackCluster',
    cloudProvider: 'tencentcloud',
    component: RollbackCluster,
    validators: [
      { type: 'requiredField', fieldName: 'cluster' },
      { type: 'requiredField', fieldName: 'regions' },
      { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
    ],
  });
});
