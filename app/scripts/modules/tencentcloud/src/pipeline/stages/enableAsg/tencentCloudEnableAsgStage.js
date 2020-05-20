'use strict';

const angular = require('angular');
import { EnableAgsStage } from './enableAsg';

import { AccountService, Registry, StageConstants } from '@spinnaker/core';

export const TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG_TENCENTCLOUDENABLEASGSTAGE =
  'spinnaker.tencentcloud.pipeline.stage.enableAsgStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG_TENCENTCLOUDENABLEASGSTAGE, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'enableServerGroup',
    alias: 'enableAsg',
    cloudProvider: 'tencentcloud',
    component: EnableAgsStage,
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
