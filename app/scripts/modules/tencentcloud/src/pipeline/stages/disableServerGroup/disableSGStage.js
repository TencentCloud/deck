'use strict';

const angular = require('angular');
import { Registry } from '@spinnaker/core';
import { DisableServerGroup } from './DisableServerGroup';

export const TENCENTCLOUD_PIPELINE_STAGES_DISABLE_SG = 'spinnaker.tencentcloud.pipeline.stage.disableSgStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_DISABLE_SG, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'disableServerGroup',
    alias: 'disableServerGroup',
    component: DisableServerGroup,
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
