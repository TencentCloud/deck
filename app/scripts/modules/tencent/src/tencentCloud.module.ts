import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

import { TENCENTCLOUD_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { TENCENT_REACT_MODULE } from './reactShims/tencentCloud.react.module';
import { TENCENTCLOUD_SECURITY_GROUP_MODULE } from './securityGroup/securityGroup.module';
import { TENCENTCLOUD_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
import './validation/ApplicationNameValidator';
import { VPC_MODULE } from './vpc/vpc.module';
import { SUBNET_RENDERER } from './subnet/subnet.renderer';
import { SERVER_GROUP_DETAILS_MODULE } from './serverGroup/details/serverGroupDetails.module';
import { COMMON_MODULE } from './common/common.module';
import './help/tencentcloud.help';

import { TencentCloudImageReader } from './image';
import { TencentCloudLoadBalancerClusterContainer } from './loadBalancer/TencentCloudLoadBalancerClusterContainer';
import { TencentCloudLoadBalancersTag } from './loadBalancer/TencentCloudLoadBalancersTag';

import './deploymentStrategy/rollingPush.strategy';

import './logo/tencent.logo.less';
import { TencentCloudCloneServerGroupModal } from './serverGroup/configure/wizard/CloneServerGroupModal';
import { CreateApplicationLoadBalancer } from './loadBalancer/configure/application/CreateApplicationLoadBalancer';
import { TencentCloudServerGroupActions } from './serverGroup/details/TencentCloudServerGroupActions';
import { tencentCloudServerGroupDetailsGetter } from './serverGroup/details/tencentCloudServerGroupDetailsGetter';

import {
  AdvancedSettingsDetailsSection,
  TencentCloudInfoDetailsSection,
  CapacityDetailsSection,
  HealthDetailsSection,
  LaunchConfigDetailsSection,
  LogsDetailsSection,
  PackageDetailsSection,
  ScalingPoliciesDetailsSection,
  // ScalingProcessesDetailsSection,
  ScheduledActionsDetailsSection,
  SecurityGroupsDetailsSection,
  TagsDetailsSection,
} from './serverGroup/details/sections';

import { DEPLOY_CLOUDFORMATION_STACK_STAGE } from './pipeline/stages/deployCloudFormation/deployCloudFormationStackStage';
import { CLOUDFORMATION_TEMPLATE_ENTRY } from './pipeline/stages/deployCloudFormation/cloudFormationTemplateEntry.component';
import { TENCENT_PIPELINE_STAGES_BAKE_TENCENTCLOUDBAKESTAGE } from './pipeline/stages/bake/tencentCloudBakeStage';
import { TENCENT_PIPELINE_STAGES_CLONESERVERGROUP_TENCENTCLOUDCLONESERVERGROUPSTAGE } from './pipeline/stages/cloneServerGroup/tencentCloudCloneServerGroupStage';
import { TENCENT_PIPELINE_STAGES_DESTROYASG_TENCENTCLOUDDESTROYASGSTAGE } from './pipeline/stages/destroyAsg/tencentCloudDestroyAsgStage';
import { TENCENT_PIPELINE_STAGES_DISABLEASG_TENCENTCLOUDDISABLEASGSTAGE } from './pipeline/stages/disableAsg/tencentCloudDisableAsgStage';
import { TENCENT_PIPELINE_STAGES_DISABLECLUSTER_TENCENTCLOUDDISABLECLUSTERSTAGE } from './pipeline/stages/disableCluster/tencentCloudDisableClusterStage';
import { TENCENT_PIPELINE_STAGES_ROLLBACKCLUSTER_TENCENTCLOUDROLLBACKCLUSTERSTAGE } from './pipeline/stages/rollbackCluster/tencentCloudRollbackClusterStage';
import { TENCENT_PIPELINE_STAGES_ENABLEASG_TENCENTCLOUDENABLEASGSTAGE } from './pipeline/stages/enableAsg/tencentCloudEnableAsgStage';
import { TENCENT_PIPELINE_STAGES_FINDAMI_TENCENTCLOUDFINDAMISTAGE } from './pipeline/stages/findAmi/tencentCloudFindAmiStage';
import { TENCENT_PIPELINE_STAGES_FINDIMAGEFROMTAGS_TENCENTCLOUDFINDIMAGEFROMTAGSSTAGE } from './pipeline/stages/findImageFromTags/tencentCloudFindImageFromTagsStage';
import { TENCENT_PIPELINE_STAGES_MODIFYSCALINGPROCESS_MODIFYSCALINGPROCESSSTAGE } from './pipeline/stages/modifyScalingProcess/modifyScalingProcessStage';
import { TENCENT_PIPELINE_STAGES_RESIZEASG_TENCENTCLOUDRESIZEASGSTAGE } from './pipeline/stages/resizeAsg/tencentCloudResizeAsgStage';
import { TENCENT_PIPELINE_STAGES_SCALEDOWNCLUSTER_TENCENTCLOUDSCALEDOWNCLUSTERSTAGE } from './pipeline/stages/scaleDownCluster/tencentCloudScaleDownClusterStage';
import { TENCENT_PIPELINE_STAGES_SHRINKCLUSTER_TENCENTCLOUDSHRINKCLUSTERSTAGE } from './pipeline/stages/shrinkCluster/tencentCloudShrinkClusterStage';
import { TENCENT_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE } from './pipeline/stages/tagImage/tencentCloudTagImageStage';
import { TENCENT_INSTANCE_TENCENTCLOUDINSTANCETYPE_SERVICE } from './instance/tencentCloudInstanceType.service';
import { TENCENT_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER } from './instance/details/instance.details.controller';
import { TENCENT_SEARCH_SEARCHRESULTFORMATTER } from './search/searchResultFormatter';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const TENCENT_MODULE = 'spinnaker.tencent';
module(TENCENT_MODULE, [
  TENCENT_REACT_MODULE,
  TENCENT_PIPELINE_STAGES_BAKE_TENCENTCLOUDBAKESTAGE,
  TENCENT_PIPELINE_STAGES_CLONESERVERGROUP_TENCENTCLOUDCLONESERVERGROUPSTAGE,
  TENCENT_PIPELINE_STAGES_DESTROYASG_TENCENTCLOUDDESTROYASGSTAGE,
  TENCENT_PIPELINE_STAGES_DISABLEASG_TENCENTCLOUDDISABLEASGSTAGE,
  TENCENT_PIPELINE_STAGES_DISABLECLUSTER_TENCENTCLOUDDISABLECLUSTERSTAGE,
  TENCENT_PIPELINE_STAGES_ROLLBACKCLUSTER_TENCENTCLOUDROLLBACKCLUSTERSTAGE,
  TENCENT_PIPELINE_STAGES_ENABLEASG_TENCENTCLOUDENABLEASGSTAGE,
  TENCENT_PIPELINE_STAGES_FINDAMI_TENCENTCLOUDFINDAMISTAGE,
  TENCENT_PIPELINE_STAGES_FINDIMAGEFROMTAGS_TENCENTCLOUDFINDIMAGEFROMTAGSSTAGE,
  TENCENT_PIPELINE_STAGES_MODIFYSCALINGPROCESS_MODIFYSCALINGPROCESSSTAGE,
  TENCENT_PIPELINE_STAGES_RESIZEASG_TENCENTCLOUDRESIZEASGSTAGE,
  TENCENT_PIPELINE_STAGES_SCALEDOWNCLUSTER_TENCENTCLOUDSCALEDOWNCLUSTERSTAGE,
  TENCENT_PIPELINE_STAGES_SHRINKCLUSTER_TENCENTCLOUDSHRINKCLUSTERSTAGE,
  TENCENT_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE,
  SERVER_GROUP_DETAILS_MODULE,
  COMMON_MODULE,
  TENCENTCLOUD_SERVER_GROUP_TRANSFORMER,
  TENCENT_INSTANCE_TENCENTCLOUDINSTANCETYPE_SERVICE,
  TENCENTCLOUD_LOAD_BALANCER_MODULE,
  TENCENT_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER,
  TENCENTCLOUD_SECURITY_GROUP_MODULE,
  SUBNET_RENDERER,
  VPC_MODULE,
  TENCENT_SEARCH_SEARCHRESULTFORMATTER,
  DEPLOY_CLOUDFORMATION_STACK_STAGE,
  CLOUDFORMATION_TEMPLATE_ENTRY,
]).config(() => {
  CloudProviderRegistry.registerProvider('tencent', {
    name: 'Tencent',
    logo: {
      path: require('./logo/tencent.logo.svg'),
    },
    image: {
      reader: TencentCloudImageReader,
    },
    serverGroup: {
      transformer: 'tencentServerGroupTransformer',
      detailsActions: TencentCloudServerGroupActions,
      detailsGetter: tencentCloudServerGroupDetailsGetter,
      detailsSections: [
        TencentCloudInfoDetailsSection,
        CapacityDetailsSection,
        HealthDetailsSection,
        LaunchConfigDetailsSection,
        SecurityGroupsDetailsSection,
        // ScalingProcessesDetailsSection,
        ScalingPoliciesDetailsSection,
        ScheduledActionsDetailsSection,
        TagsDetailsSection,
        PackageDetailsSection,
        AdvancedSettingsDetailsSection,
        LogsDetailsSection,
      ],
      CloneServerGroupModal: TencentCloudCloneServerGroupModal,
      commandBuilder: 'tencentServerGroupCommandBuilder',
      configurationService: 'tencentServerGroupConfigurationService',
      scalingActivitiesEnabled: true,
    },
    instance: {
      instanceTypeService: 'tencentInstanceTypeService',
      detailsTemplateUrl: require('./instance/details/instanceDetails.html'),
      detailsController: 'tencentInstanceDetailsCtrl',
    },
    loadBalancer: {
      transformer: 'tencentLoadBalancerTransformer',
      detailsTemplateUrl: require('./loadBalancer/details/loadBalancerDetails.html'),
      detailsController: 'tencentLoadBalancerDetailsCtrl',
      CreateLoadBalancerModal: CreateApplicationLoadBalancer,
      targetGroupDetailsTemplateUrl: require('./loadBalancer/details/targetGroupDetails.html'),
      targetGroupDetailsController: 'tencentTargetGroupDetailsCtrl',
      ClusterContainer: TencentCloudLoadBalancerClusterContainer,
      LoadBalancersTag: TencentCloudLoadBalancersTag,
    },
    securityGroup: {
      transformer: 'tencentSecurityGroupTransformer',
      reader: 'tencentSecurityGroupReader',
      detailsTemplateUrl: require('./securityGroup/details/securityGroupDetail.html'),
      detailsController: 'tencentSecurityGroupDetailsCtrl',
      createSecurityGroupTemplateUrl: require('./securityGroup/configure/createSecurityGroup.html'),
      createSecurityGroupController: 'tencentCreateSecurityGroupCtrl',
    },
    subnet: {
      renderer: 'tencentSubnetRenderer',
    },
    search: {
      resultFormatter: 'tencentSearchResultFormatter',
    },
  });
});

DeploymentStrategyRegistry.registerProvider('tencent', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);
