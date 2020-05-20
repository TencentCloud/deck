'use strict';

const angular = require('angular');

import { Registry } from '@spinnaker/core';
import { TagImageExecutionDetails } from './TagImageExecutionDetails';
import { ExecutionDetailsTasks } from '@spinnaker/core';
import { TagImage } from './TagImage';

export const TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE =
  'spinnaker.tencentcloud.pipeline.stage.tagImageStage';
angular.module(TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'upsertImageTags',
    cloudProvider: 'tencentcloud',
    component: TagImage,
    executionDetailsSections: [TagImageExecutionDetails, ExecutionDetailsTasks],
    executionConfigSections: ['tagImageConfig', 'taskStatus'],
  });
});
