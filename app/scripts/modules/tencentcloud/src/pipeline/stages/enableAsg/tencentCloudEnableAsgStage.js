'use strict';

const angular = require('angular');
import { Registry } from '@spinnaker/core';
import { EnableAgsStage } from './enableAsg';

export const TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG = 'spinnaker.tencentcloud.pipeline.stage.enableAsgStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG, []).config(function() {
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
