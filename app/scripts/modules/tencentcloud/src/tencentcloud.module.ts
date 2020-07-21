'use strict';

import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';
import './help/tencentcloud.help';
import { TencentcloudImageReader } from './image';
import { TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER } from './search/searchResultFormatter';
import { TENCENTCLOUD_REACT_MODULE } from './reactShims/tencentcloud.react.module';
import './validation/ApplicationNameValidator';

// load pipeline stage
import { TENCENTCLOUD_PIPELINE_STAGES_ENABLE_SG } from './pipeline/stages/enableServerGroup/enableSgStage';
import { TENCENTCLOUD_PIPELINE_STAGES_DISABLE_SG } from './pipeline/stages/disableServerGroup/disableSGStage';
import { TENCENTCLOUD_PIPELINE_STAGES_DISABLE_CLUSTER } from './pipeline/stages/disableCluster/disableClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_ROLLBACK_CLUSTER } from './pipeline/stages/rollbackCluster/rollbackClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWN_CLUSTER } from './pipeline/stages/scaleDownCluster/scaleDownClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_SHRINK_CLUSTER } from './pipeline/stages/shrinkCluster/shrinkClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_TAG_IMAGE } from './pipeline/stages/tagImage/tagImageStage';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const TENCENTCLOUD_MODULE = 'spinnaker.tencentcloud';
module(TENCENTCLOUD_MODULE, [
  TENCENTCLOUD_REACT_MODULE,
  TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER,
  TENCENTCLOUD_PIPELINE_STAGES_ENABLE_SG,
  TENCENTCLOUD_PIPELINE_STAGES_DISABLE_SG,
  TENCENTCLOUD_PIPELINE_STAGES_DISABLE_CLUSTER,
  TENCENTCLOUD_PIPELINE_STAGES_ROLLBACK_CLUSTER,
  TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWN_CLUSTER,
  TENCENTCLOUD_PIPELINE_STAGES_SHRINK_CLUSTER,
  TENCENTCLOUD_PIPELINE_STAGES_TAG_IMAGE,
]).config(() => {
  CloudProviderRegistry.registerProvider('tencentcloud', {
    name: 'tencentcloud',
    logo: {
      path: require('./logo/tencentcloud.logo.svg'),
    },
    image: {
      reader: TencentcloudImageReader,
    },
  });
});

DeploymentStrategyRegistry.registerProvider('tencentcloud', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);
