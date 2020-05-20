import { module } from 'angular';

import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';

import { TENCENTCLOUD_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { TENCENTCLOUD_REACT_MODULE } from './reactShims/tencentcloud.react.module';
import { TENCENTCLOUD_SECURITY_GROUP_MODULE } from './securityGroup/securityGroup.module';
import { TENCENTCLOUD_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';

import './validation/ApplicationNameValidator';
import { VPC_MODULE } from './vpc/vpc.module';
import { SUBNET_RENDERER } from './subnet/subnet.renderer';

import { TENCENTCLOUD_SERVERGROUP_CONFIGURE_SERVERGROUPCOMMANDBUILDER_SERVICE } from './serverGroup/configure/serverGroupCommandBuilder.service';

import { COMMON_MODULE } from './common/common.module';
import './help/tencentcloud.help';

import { TencentcloudImageReader } from './image';
import { TencentcloudLoadBalancerClusterContainer } from './loadBalancer/TencentcloudLoadBalancerClusterContainer';
import { TencentcloudLoadBalancersTag } from './loadBalancer/TencentcloudLoadBalancersTag';

import './deploymentStrategy/rollingPush.strategy';

import './logo/tencentcloud.logo.less';
import { TencentcloudCloneServerGroupModal } from './serverGroup/configure/wizard/CloneServerGroupModal';
import { CreateApplicationLoadBalancer } from './loadBalancer/configure/application/CreateApplicationLoadBalancer';
import { TencentcloudServerGroupActions } from './serverGroup/details/TencentcloudServerGroupActions';
import { tencentcloudServerGroupDetailsGetter } from './serverGroup/details/tencentcloudServerGroupDetailsGetter';
import LoadBalancerDetails from './loadBalancer/details/loadBalancerDetails';
import {
  AdvancedSettingsDetailsSection,
  TencentcloudInfoDetailsSection,
  CapacityDetailsSection,
  HealthDetailsSection,
  LaunchConfigDetailsSection,
  LogsDetailsSection,
  PackageDetailsSection,
  ScalingPoliciesDetailsSection,
  ScalingProcessesDetailsSection,
  ScheduledActionsDetailsSection,
  SecurityGroupsDetailsSection,
  TagsDetailsSection,
} from './serverGroup/details/sections';
import SecurityGroupDetails from './securityGroup/details/SecurityGroupDetails';

import { CreateSecurityGroupModal } from './securityGroup/configure/CreateSecurityGroup/CreateSecurityGroupModal';

import { TENCENTCLOUD_PIPELINE_STAGES_CLONESERVERGROUP_TENCENTCLOUDCLONESERVERGROUPSTAGE } from './pipeline/stages/cloneServerGroup/tencentcloudCloneServerGroupStage';
import { TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG_TENCENTCLOUDDISABLEASGSTAGE } from './pipeline/stages/disableAsg/tencentcloudDisableAsgStage';
import { TENCENTCLOUD_PIPELINE_STAGES_DISABLECLUSTER_TENCENTCLOUDDISABLECLUSTERSTAGE } from './pipeline/stages/disableCluster/tencentcloudDisableClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_ROLLBACKCLUSTER_TENCENTCLOUDROLLBACKCLUSTERSTAGE } from './pipeline/stages/rollbackCluster/tencentcloudRollbackClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG_TENCENTCLOUDENABLEASGSTAGE } from './pipeline/stages/enableAsg/tencentcloudEnableAsgStage';
import { TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWNCLUSTER_TENCENTCLOUDSCALEDOWNCLUSTERSTAGE } from './pipeline/stages/scaleDownCluster/tencentcloudScaleDownClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER_TENCENTCLOUDSHRINKCLUSTERSTAGE } from './pipeline/stages/shrinkCluster/tencentcloudShrinkClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE } from './pipeline/stages/tagImage/tencentcloudTagImageStage';
import { TENCENTCLOUD_INSTANCE_TENCENTCLOUDINSTANCETYPE_SERVICE } from './instance/tencentcloudInstanceType.service';
import { TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER } from './search/searchResultFormatter';

// load all templates into the $templateCache
const templates = require.context('./', true, /\.html$/);
templates.keys().forEach(function(key) {
  templates(key);
});

import tencentcloudLogo from './logo/tencentcloud.logo.svg';

export const TENCENTCLOUD_MODULE = 'spinnaker.tencentcloud';

module(TENCENTCLOUD_MODULE, [
  TENCENTCLOUD_REACT_MODULE,
  TENCENTCLOUD_PIPELINE_STAGES_CLONESERVERGROUP_TENCENTCLOUDCLONESERVERGROUPSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG_TENCENTCLOUDDISABLEASGSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_DISABLECLUSTER_TENCENTCLOUDDISABLECLUSTERSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_ROLLBACKCLUSTER_TENCENTCLOUDROLLBACKCLUSTERSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG_TENCENTCLOUDENABLEASGSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWNCLUSTER_TENCENTCLOUDSCALEDOWNCLUSTERSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER_TENCENTCLOUDSHRINKCLUSTERSTAGE,
  TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE_TENCENTCLOUDTAGIMAGESTAGE,
  TENCENTCLOUD_SERVERGROUP_CONFIGURE_SERVERGROUPCOMMANDBUILDER_SERVICE,
  COMMON_MODULE,
  TENCENTCLOUD_SERVER_GROUP_TRANSFORMER,
  TENCENTCLOUD_INSTANCE_TENCENTCLOUDINSTANCETYPE_SERVICE,
  TENCENTCLOUD_LOAD_BALANCER_MODULE,
  TENCENTCLOUD_SECURITY_GROUP_MODULE,
  SUBNET_RENDERER,
  VPC_MODULE,
  TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER,
]).config(() => {
  CloudProviderRegistry.registerProvider('tencentcloud', {
    name: 'Tencentcloud',
    logo: {
      path: tencentcloudLogo,
    },
    image: {
      reader: TencentcloudImageReader,
    },
    serverGroup: {
      transformer: 'tencentcloudServerGroupTransformer',
      detailsActions: TencentcloudServerGroupActions,
      detailsGetter: tencentcloudServerGroupDetailsGetter,
      detailsSections: [
        TencentcloudInfoDetailsSection,
        CapacityDetailsSection,
        HealthDetailsSection,
        LaunchConfigDetailsSection,
        SecurityGroupsDetailsSection,
        ScalingProcessesDetailsSection,
        ScalingPoliciesDetailsSection,
        ScheduledActionsDetailsSection,
        TagsDetailsSection,
        PackageDetailsSection,
        AdvancedSettingsDetailsSection,
        LogsDetailsSection,
      ],
      CloneServerGroupModal: TencentcloudCloneServerGroupModal,
      commandBuilder: 'tencentcloudServerGroupCommandBuilder',
      configurationService: 'tencentcloudServerGroupConfigurationService',
      scalingActivitiesEnabled: true,
    },
    loadBalancer: {
      transformer: 'tencentcloudLoadBalancerTransformer',
      details: LoadBalancerDetails,
      CreateLoadBalancerModal: CreateApplicationLoadBalancer,
      ClusterContainer: TencentcloudLoadBalancerClusterContainer,
      LoadBalancersTag: TencentcloudLoadBalancersTag,
    },
    securityGroup: {
      transformer: 'tencentcloudSecurityGroupTransformer',
      reader: 'tencentcloudSecurityGroupReader',
      CreateSecurityGroupModal,
      details: SecurityGroupDetails,
    },
    subnet: {
      renderer: 'tencentcloudSubnetRenderer',
    },
    search: {
      resultFormatter: 'tencentcloudSearchResultFormatter',
    },
  });
});

DeploymentStrategyRegistry.registerProvider('tencentcloud', ['custom', 'redblack', 'rollingpush', 'rollingredblack']);
