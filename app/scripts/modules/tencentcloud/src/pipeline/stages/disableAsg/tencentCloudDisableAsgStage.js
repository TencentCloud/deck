'use strict';

const angular = require('angular');
import { DisbaleAgsStage } from './disableAsg';
import { AccountService, Registry, StageConstants } from '@spinnaker/core';

export const TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG_TENCENTCLOUDDISABLEASGSTAGE =
  'spinnaker.tencentcloud.pipeline.stage.disableAsgStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG_TENCENTCLOUDDISABLEASGSTAGE, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'disableServerGroup',
    alias: 'disableAsg',
    component: DisbaleAgsStage,
    cloudProvider: 'tencentcloud',
    validators: [
      {
        type: 'targetImpedance',
        message:
          'This pipeline will attempt to disable a server group without deploying a new version into the same cluster.',
      },
      {
        type: 'requiredField',
        fieldName: 'cluster',
      },
      {
        type: 'requiredField',
        fieldName: 'target',
      },
      {
        type: 'requiredField',
        fieldName: 'regions',
      },
      {
        type: 'requiredField',
        fieldName: 'credentials',
        fieldLabel: 'account',
      },
    ],
  });
});
