'use strict';

const angular = require('angular');
import { Registry } from '@spinnaker/core';
import { DisableClusterStage } from './DisableClusterStage';

export const TENCENTCLOUD_PIPELINE_STAGES_DISABLECLUSTER = 'spinnaker.tencentcloud.pipeline.stage.disableClusterStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_DISABLECLUSTER, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'disableCluster',
    cloudProvider: 'tencentcloud',
    component: DisableClusterStage,
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
