'use strict';

const angular = require('angular');

import { Registry } from '@spinnaker/core';
import { CloneServerGroupStage } from './CloneServerGroupStage';
import { CloneServerGroupStepLabel } from './CloneServerGroupStepLabel';

export const TENCENT_PIPELINE_STAGES_CLONESERVERGROUP_TENCENTCLOUDCLONESERVERGROUPSTAGE =
  'spinnaker.tencent.pipeline.stage.cloneServerGroupStage';
export const name = TENCENT_PIPELINE_STAGES_CLONESERVERGROUP_TENCENTCLOUDCLONESERVERGROUPSTAGE; // for backwards compatibility
angular.module(TENCENT_PIPELINE_STAGES_CLONESERVERGROUP_TENCENTCLOUDCLONESERVERGROUPSTAGE, []).config(function() {
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
