'use strict';

const angular = require('angular');
import { DisableClusterStage } from './DisableClusterStage';

import { AccountService, Registry } from '@spinnaker/core';

export const TENCENT_PIPELINE_STAGES_DISABLECLUSTER_TENCENTCLOUDDISABLECLUSTERSTAGE =
  'spinnaker.tencent.pipeline.stage.disableClusterStage';
export const name = TENCENT_PIPELINE_STAGES_DISABLECLUSTER_TENCENTCLOUDDISABLECLUSTERSTAGE; // for backwards compatibility
angular.module(TENCENT_PIPELINE_STAGES_DISABLECLUSTER_TENCENTCLOUDDISABLECLUSTERSTAGE, []).config(function() {
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
