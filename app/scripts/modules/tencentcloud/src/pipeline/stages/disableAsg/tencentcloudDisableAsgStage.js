'use strict';

const angular = require('angular');
import { Registry } from '@spinnaker/core';
import { DisbaleAgsStage } from './disableAsg';

export const TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG = 'spinnaker.tencentcloud.pipeline.stage.disableAsgStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG, []).config(function() {
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
