'use strict';

const angular = require('angular');

import { Registry } from '@spinnaker/core';
import { TagImageExecutionDetails } from './TagImageExecutionDetails';
import { ExecutionDetailsTasks } from '@spinnaker/core';
import { TagImage } from './TagImage';

export const TENCENT_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE =
  'spinnaker.tencent.pipeline.stage.tagImageStage';
export const name = TENCENT_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE; // for backwards compatibility
angular.module(TENCENT_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE, []).config(function() {
  Registry.pipeline.registerStage({
    provides: 'upsertImageTags',
    cloudProvider: 'tencentcloud',
    component: TagImage,
    executionDetailsSections: [TagImageExecutionDetails, ExecutionDetailsTasks],
    executionConfigSections: ['tagImageConfig', 'taskStatus'],
  });
});
