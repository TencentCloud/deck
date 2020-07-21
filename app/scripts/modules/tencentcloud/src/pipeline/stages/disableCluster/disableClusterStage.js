'use strict';

const angular = require('angular');
import { Registry } from '@spinnaker/core';
import { DisableCluster } from './DisableCluster';

export const TENCENTCLOUD_PIPELINE_STAGES_DISABLE_CLUSTER = 'spinnaker.tencentcloud.pipeline.stage.disableClusterStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_DISABLE_CLUSTER, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'disableCluster',
    cloudProvider: 'tencentcloud',
    component: DisableCluster,
    validators: [
      { type: 'requiredField', fieldName: 'cluster' },
      {
        type: 'requiredField',
        fieldName: 'remainingEnabledServerGroups',
        fieldLabel: 'Keep [X] enabled Server Groups',
      },
      { type: 'requiredField', fieldName: 'regions' },
      { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
    ],
  });
});
