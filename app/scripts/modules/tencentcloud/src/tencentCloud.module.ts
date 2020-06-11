import { CloudProviderRegistry, DeploymentStrategyRegistry } from '@spinnaker/core';
import { module } from 'angular';
import { COMMON_MODULE } from './common/common.module';
import './deploymentStrategy/rollingPush.strategy';
import './help/tencentcloud.help';
import { TencentcloudImageReader } from './image';
import { TENCENTCLOUD_INSTANCETYPE_SERVICE } from './instance/tencentcloudInstanceType.service';
import { CreateApplicationLoadBalancer } from './loadBalancer/configure/application/CreateApplicationLoadBalancer';
import LoadBalancerDetails from './loadBalancer/details/loadBalancerDetails';
import { TENCENTCLOUD_LOAD_BALANCER_MODULE } from './loadBalancer/loadBalancer.module';
import { TencentcloudLoadBalancerClusterContainer } from './loadBalancer/TencentcloudLoadBalancerClusterContainer';
import { TencentcloudLoadBalancersTag } from './loadBalancer/TencentcloudLoadBalancersTag';
import './logo/tencentcloud.logo.less';
import tencentcloudLogo from './logo/tencentcloud.logo.svg';
import { TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG } from './pipeline/stages/enableAsg/tencentcloudEnableAsgStage';
import { TENCENTCLOUD_PIPELINE_STAGES_CLONESERVERGROUP } from './pipeline/stages/cloneServerGroup/tencentCloudCloneServerGroupStage';
import { TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG } from './pipeline/stages/disableAsg/tencentCloudDisableAsgStage';
import { TENCENTCLOUD_PIPELINE_STAGES_DISABLECLUSTER } from './pipeline/stages/disableCluster/tencentCloudDisableClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_ROLLBACKCLUSTER } from './pipeline/stages/rollbackCluster/tencentcloudRollbackClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWNCLUSTER } from './pipeline/stages/scaleDownCluster/tencentcloudScaleDownClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER } from './pipeline/stages/shrinkCluster/tencentCloudShrinkClusterStage';
import { TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE } from './pipeline/stages/tagImage/tencentcloudTagImageStage';

import { TENCENTCLOUD_REACT_MODULE } from './reactShims/tencentcloud.react.module';
import { TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER } from './search/searchResultFormatter';
import { CreateSecurityGroupModal } from './securityGroup/configure/CreateSecurityGroup/CreateSecurityGroupModal';

import { TENCENTCLOUD_SECURITY_GROUP_MODULE } from './securityGroup/securityGroup.module';
import { TencentcloudCloneServerGroupModal } from './serverGroup/configure/wizard/CloneServerGroupModal';
import { TENCENTCLOUD_SERVERGROUP_CONFIGURE } from './serverGroup/configure/serverGroupCommandBuilder.service';

import SecurityGroupDetails from './securityGroup/details/SecurityGroupDetails';

import {
  AdvancedSettingsDetailsSection,
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
  TencentcloudInfoDetailsSection,
} from './serverGroup/details/sections';
import { TencentcloudServerGroupActions } from './serverGroup/details/TencentcloudServerGroupActions';
import { tencentcloudServerGroupDetailsGetter } from './serverGroup/details/tencentcloudServerGroupDetailsGetter';
import { TENCENTCLOUD_SERVER_GROUP_TRANSFORMER } from './serverGroup/serverGroup.transformer';
import { SUBNET_RENDERER } from './subnet/subnet.renderer';
import './validation/ApplicationNameValidator';
import { VPC_MODULE } from './vpc/vpc.module';

export const TENCENTCLOUD_MODULE = 'spinnaker.tencentcloud';
module(TENCENTCLOUD_MODULE, [
  TENCENTCLOUD_REACT_MODULE,
  COMMON_MODULE,
  SUBNET_RENDERER,
  VPC_MODULE,
  TENCENTCLOUD_SERVERGROUP_CONFIGURE,
  TENCENTCLOUD_SERVER_GROUP_TRANSFORMER,
  TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER,
  TENCENTCLOUD_INSTANCETYPE_SERVICE,
  TENCENTCLOUD_LOAD_BALANCER_MODULE,
  TENCENTCLOUD_SECURITY_GROUP_MODULE,
  TENCENTCLOUD_PIPELINE_STAGES_CLONESERVERGROUP,
  TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG,
  TENCENTCLOUD_PIPELINE_STAGES_DISABLECLUSTER,
  TENCENTCLOUD_PIPELINE_STAGES_ROLLBACKCLUSTER,
  TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG,
  TENCENTCLOUD_PIPELINE_STAGES_SCALEDOWNCLUSTER,
  TENCENTCLOUD_PIPELINE_STAGES_SHRINKCLUSTER,
  TENCENTCLOUD_PIPELINE_STAGES_TAGIMAGE,
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
