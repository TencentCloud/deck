'use strict';

const angular = require('angular');

import { Registry } from '@spinnaker/core';
import { CloneServerGroupStage } from './CloneServerGroupStage';
import { CloneServerGroupStepLabel } from './CloneServerGroupStepLabel';

export const TENCENTCLOUD_PIPELINE_STAGES_CLONESERVERGROUP_TENCENTCLOUDCLONESERVERGROUPSTAGE =
  'spinnaker.tencentcloud.pipeline.stage.cloneServerGroupStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_CLONESERVERGROUP_TENCENTCLOUDCLONESERVERGROUPSTAGE, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'cloneServerGroup',
    cloudProvider: 'tencentcloud',
    component: CloneServerGroupStage,
    executionLabelComponent: CloneServerGroupStepLabel,
    accountExtractor: stage => stage.context.credentials,
    validators: [
      { type: 'requiredField', fieldName: 'targetCluster', fieldLabel: 'cluster' },
      { type: 'requiredField', fieldName: 'target' },
      { type: 'requiredField', fieldName: 'region' },
      { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
    ],
  });
});
