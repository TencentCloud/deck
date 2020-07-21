'use strict';

const angular = require('angular');
import { Registry } from '@spinnaker/core';
import { EnableServerGroup } from './EnableServerGroup';

export const TENCENTCLOUD_PIPELINE_STAGES_ENABLE_SG = 'spinnaker.tencentcloud.pipeline.stage.enableSgStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_ENABLE_SG, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'enableServerGroup',
    alias: 'enableServerGroup',
    cloudProvider: 'tencentcloud',
    component: EnableServerGroup,
    validators: [
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
