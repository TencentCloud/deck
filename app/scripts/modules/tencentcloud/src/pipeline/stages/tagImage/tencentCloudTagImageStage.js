'use strict';

const angular = require('angular');

import { ExecutionDetailsTasks, Registry } from '@spinnaker/core';
import { TagImage } from './TagImage';
import { TagImageExecutionDetails } from './TagImageExecutionDetails';

export const TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE = 'spinnaker.tencentcloud.pipeline.stage.tagImageStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'upsertImageTags',
    cloudProvider: 'tencentcloud',
    component: TagImage,
    executionDetailsSections: [TagImageExecutionDetails, ExecutionDetailsTasks],
    executionConfigSections: ['tagImageConfig', 'taskStatus'],
  });
});
