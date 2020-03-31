import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

import { AWS_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { TENCENT_REACT_MODULE } from './reactShims/aws.react.module';
import { AWS_SECURITY_GROUP_MODULE } from './securityGroup/securityGroup.module';
import { AWS_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
import './validation/ApplicationNameValidator';
import { VPC_MODULE } from './vpc/vpc.module';
import { SUBNET_RENDERER } from './subnet/subnet.renderer';
import { SERVER_GROUP_DETAILS_MODULE } from './serverGroup/details/serverGroupDetails.module';
import { COMMON_MODULE } from './common/common.module';
import './help/amazon.help';

import { AwsImageReader } from './image';
import { AmazonLoadBalancerClusterContainer } from './loadBalancer/AmazonLoadBalancerClusterContainer';
import { AmazonLoadBalancersTag } from './loadBalancer/AmazonLoadBalancersTag';

import './deploymentStrategy/rollingPush.strategy';

import './logo/tencent.logo.less';
import { AmazonCloneServerGroupModal } from './serverGroup/configure/wizard/AmazonCloneServerGroupModal';
import { CreateApplicationLoadBalancer } from './loadBalancer/configure/application/CreateApplicationLoadBalancer';
import { AmazonServerGroupActions } from './serverGroup/details/AmazonServerGroupActions';
import { amazonServerGroupDetailsGetter } from './serverGroup/details/amazonServerGroupDetailsGetter';

import {
  AdvancedSettingsDetailsSection,
  AmazonInfoDetailsSection,
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
import { name as PIPELINE_STAGES_BAKE_AWSBAKESTAGE } from './pipeline/stages/bake/awsBakeStage';
import { name as PIPELINE_STAGES_CLONESERVERGROUP_AWSCLONESERVERGROUPSTAGE } from './pipeline/stages/cloneServerGroup/awsCloneServerGroupStage';
import { name as PIPELINE_STAGES_DESTROYASG_AWSDESTROYASGSTAGE } from './pipeline/stages/destroyAsg/awsDestroyAsgStage';
import { name as PIPELINE_STAGES_DISABLEASG_AWSDISABLEASGSTAGE } from './pipeline/stages/disableAsg/awsDisableAsgStage';
import { name as PIPELINE_STAGES_DISABLECLUSTER_AWSDISABLECLUSTERSTAGE } from './pipeline/stages/disableCluster/awsDisableClusterStage';
import { name as PIPELINE_STAGES_ROLLBACKCLUSTER_AWSROLLBACKCLUSTERSTAGE } from './pipeline/stages/rollbackCluster/awsRollbackClusterStage';
import { name as PIPELINE_STAGES_ENABLEASG_AWSENABLEASGSTAGE } from './pipeline/stages/enableAsg/awsEnableAsgStage';
import { name as PIPELINE_STAGES_FINDAMI_AWSFINDAMISTAGE } from './pipeline/stages/findAmi/awsFindAmiStage';
import { name as PIPELINE_STAGES_FINDIMAGEFROMTAGS_AWSFINDIMAGEFROMTAGSSTAGE } from './pipeline/stages/findImageFromTags/awsFindImageFromTagsStage';
import { name as PIPELINE_STAGES_MODIFYSCALINGPROCESS_MODIFYSCALINGPROCESSSTAGE } from './pipeline/stages/modifyScalingProcess/modifyScalingProcessStage';
import { name as PIPELINE_STAGES_RESIZEASG_AWSRESIZEASGSTAGE } from './pipeline/stages/resizeAsg/awsResizeAsgStage';
import { name as PIPELINE_STAGES_SCALEDOWNCLUSTER_AWSSCALEDOWNCLUSTERSTAGE } from './pipeline/stages/scaleDownCluster/awsScaleDownClusterStage';
import { name as PIPELINE_STAGES_SHRINKCLUSTER_AWSSHRINKCLUSTERSTAGE } from './pipeline/stages/shrinkCluster/awsShrinkClusterStage';
import { name as PIPELINE_STAGES_TAGIMAGE_AWSTAGIMAGESTAGE } from './pipeline/stages/tagImage/awsTagImageStage';
import { name as INSTANCE_AWSINSTANCETYPE_SERVICE } from './instance/awsInstanceType.service';
import { TENCENT_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER } from './instance/details/instance.details.controller';
import { name as SEARCH_SEARCHRESULTFORMATTER } from './search/searchResultFormatter';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

export const TENCENT_MODULE = 'spinnaker.tencent';
module(TENCENT_MODULE, [
  TENCENT_REACT_MODULE,
  PIPELINE_STAGES_BAKE_AWSBAKESTAGE,
  PIPELINE_STAGES_CLONESERVERGROUP_AWSCLONESERVERGROUPSTAGE,
  PIPELINE_STAGES_DESTROYASG_AWSDESTROYASGSTAGE,
  PIPELINE_STAGES_DISABLEASG_AWSDISABLEASGSTAGE,
  PIPELINE_STAGES_DISABLECLUSTER_AWSDISABLECLUSTERSTAGE,
  PIPELINE_STAGES_ROLLBACKCLUSTER_AWSROLLBACKCLUSTERSTAGE,
  PIPELINE_STAGES_ENABLEASG_AWSENABLEASGSTAGE,
  PIPELINE_STAGES_FINDAMI_AWSFINDAMISTAGE,
  PIPELINE_STAGES_FINDIMAGEFROMTAGS_AWSFINDIMAGEFROMTAGSSTAGE,
  PIPELINE_STAGES_MODIFYSCALINGPROCESS_MODIFYSCALINGPROCESSSTAGE,
  PIPELINE_STAGES_RESIZEASG_AWSRESIZEASGSTAGE,
  PIPELINE_STAGES_SCALEDOWNCLUSTER_AWSSCALEDOWNCLUSTERSTAGE,
  PIPELINE_STAGES_SHRINKCLUSTER_AWSSHRINKCLUSTERSTAGE,
  PIPELINE_STAGES_TAGIMAGE_AWSTAGIMAGESTAGE,
  SERVER_GROUP_DETAILS_MODULE,
  COMMON_MODULE,
  AWS_SERVER_GROUP_TRANSFORMER,
  INSTANCE_AWSINSTANCETYPE_SERVICE,
  AWS_LOAD_BALANCER_MODULE,
  TENCENT_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER,
  AWS_SECURITY_GROUP_MODULE,
  SUBNET_RENDERER,
  VPC_MODULE,
  SEARCH_SEARCHRESULTFORMATTER,
  DEPLOY_CLOUDFORMATION_STACK_STAGE,
  CLOUDFORMATION_TEMPLATE_ENTRY,
]).config(() => {
  CloudProviderRegistry.registerProvider('tencent', {
    name: 'Tencent',
    logo: {
      path: require('./logo/tencent.logo.svg'),
    },
    image: {
      reader: AwsImageReader,
    },
    serverGroup: {
      transformer: 'tencentServerGroupTransformer',
      detailsActions: AmazonServerGroupActions,
      detailsGetter: amazonServerGroupDetailsGetter,
      detailsSections: [
        AmazonInfoDetailsSection,
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
      CloneServerGroupModal: AmazonCloneServerGroupModal,
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
      ClusterContainer: AmazonLoadBalancerClusterContainer,
      LoadBalancersTag: AmazonLoadBalancersTag,
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
