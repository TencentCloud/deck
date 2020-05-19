'use strict';

const angular = require('angular');
import _ from 'lodash';

import { AccountService, INSTANCE_TYPE_SERVICE, NameUtils, SubnetReader } from '@spinnaker/core';

import { TENCENTCLOUDProviderSettings } from '../../tencentCloud.settings';
import { TENCENTCLOUD_SERVER_GROUP_CONFIGURATION_SERVICE } from './serverGroupConfiguration.service';

export const TENCENTCLOUD_SERVERGROUP_CONFIGURE_SERVERGROUPCOMMANDBUILDER_SERVICE =
  'spinnaker.tencentcloud.serverGroupCommandBuilder.service';
angular
  .module(TENCENTCLOUD_SERVERGROUP_CONFIGURE_SERVERGROUPCOMMANDBUILDER_SERVICE, [
    INSTANCE_TYPE_SERVICE,
    TENCENTCLOUD_SERVER_GROUP_CONFIGURATION_SERVICE,
  ])
  .factory('tencentCloudServerGroupCommandBuilder', [
    '$q',
    'instanceTypeService',
    'tencentCloudServerGroupConfigurationService',
    function($q, instanceTypeService, tencentCloudServerGroupConfigurationService) {
      function buildNewServerGroupCommand(application, defaults) {
        defaults = defaults || {};
        const credentialsLoader = AccountService.getCredentialsKeyedByAccount('tencentcloud');

        const defaultCredentials =
          defaults.account ||
          application.defaultCredentials.tencentcloud ||
          TENCENTCLOUDProviderSettings.defaults.account;
        const defaultRegion =
          defaults.region || application.defaultRegions.tencentcloud || TENCENTCLOUDProviderSettings.defaults.region;
        const defaultSubnet = defaults.subnet || TENCENTCLOUDProviderSettings.defaults.subnetType || '';

        const preferredZonesLoader = AccountService.getAvailabilityZonesForAccountAndRegion(
          'tencentcloud',
          defaultCredentials,
          defaultRegion,
        );

        return $q
          .all({
            preferredZones: preferredZonesLoader,
            credentialsKeyedByAccount: credentialsLoader,
          })
          .then(function(asyncData) {
            const availabilityZones = asyncData.preferredZones;

            const credentials = asyncData.credentialsKeyedByAccount[defaultCredentials];
            const keyPair = credentials ? credentials.defaultKeyPair : null;
            const applicationTencentCloudSettings = _.get(application, 'attributes.providerSettings.tencentcloud', {});

            const useAmiBlockDeviceMappings = applicationTencentCloudSettings.useAmiBlockDeviceMappings || false;

            const command = {
              application: application.name,
              credentials: defaultCredentials,
              region: defaultRegion,
              strategy: '',
              capacity: {
                min: 1,
                max: 1,
                desired: 1,
              },
              targetHealthyDeployPercentage: 100,
              cooldown: 10,
              enabledMetrics: [],
              enhancedService: {
                monitorService: {
                  enabled: true,
                },
                securityService: {
                  enabled: true,
                },
              },
              ebsOptimized: false,
              selectedProvider: 'tencentcloud',
              terminationPolicies: [],
              vpcId: null,
              subnetIds: [],
              subnetType: defaultSubnet,
              availabilityZones: availabilityZones,
              keyPair: keyPair,
              suspendedProcesses: [],
              securityGroups: [],
              stack: '',
              detail: '',
              tags: {},
              useAmiBlockDeviceMappings: useAmiBlockDeviceMappings,
              copySourceCustomBlockDeviceMappings: false, // default to using block device mappings from current instance type
              viewState: {
                instanceProfile: 'custom',
                useAllImageSelection: false,
                useSimpleCapacity: true,
                usePreferredZones: true,
                mode: defaults.mode || 'create',
                disableStrategySelection: true,
                dirty: {},
                submitButtonLabel: getSubmitButtonLabel(defaults.mode || 'create'),
              },
              forwardLoadBalancers: [],
              internetAccessible: {
                internetChargeType: 'TRAFFIC_POSTPAID_BY_HOUR',
                internetMaxBandwidthOut: 1,
                publicIpAssigned: true,
              },
              systemDisk: {
                diskType: 'CLOUD_PREMIUM',
                diskSize: 50,
              },
              dataDisks: [],
              weight: 10,
              userData: '',
            };

            if (
              application.attributes &&
              application.attributes.platformHealthOnlyShowOverride &&
              application.attributes.platformHealthOnly
            ) {
              command.interestingHealthProviderNames = ['Tencentcloud'];
            }

            return command;
          });
      }

      function buildServerGroupCommandFromPipeline(application, originalCluster) {
        const pipelineCluster = _.cloneDeep(originalCluster);
        const region = pipelineCluster.region;
        const instanceTypeCategoryLoader = instanceTypeService.getCategoryForInstanceType(
          'tencentcloud',
          pipelineCluster.instanceType,
        );
        const commandOptions = {
          account: pipelineCluster.account,
          region: region,
        };
        const asyncLoader = $q.all({
          command: buildNewServerGroupCommand(application, commandOptions),
          instanceProfile: instanceTypeCategoryLoader,
        });

        return asyncLoader.then(function(asyncData) {
          const command = asyncData.command;

          const viewState = {
            instanceProfile: asyncData.instanceProfile,
            disableImageSelection: true,
            useSimpleCapacity:
              pipelineCluster.minSize === pipelineCluster.maxSize && pipelineCluster.useSourceCapacity !== true,
            usePreferredZones: true,
            mode: 'editPipeline',
            submitButtonLabel: 'Done',
            templatingEnabled: true,
            existingPipelineCluster: true,
            dirty: {},
          };
          const viewOverrides = {
            region: region,
            credentials: pipelineCluster.account || pipelineCluster.accountName,
            availabilityZones: [],
            viewState: viewState,
            securityGroups: pipelineCluster.securityGroupIds,
            tags:
              pipelineCluster.instanceTags && pipelineCluster.instanceTags.length
                ? pipelineCluster.instanceTags.reduce((pre, current) => {
                    pre[current.key] = current.value;
                    return pre;
                  }, {})
                : {},
          };

          pipelineCluster.strategy = pipelineCluster.strategy || '';

          return angular.extend({}, command, pipelineCluster, viewOverrides);
        });
      }

      // Only used to prepare view requiring template selecting
      function buildNewServerGroupCommandForPipeline() {
        return $q.when({
          viewState: {
            requiresTemplateSelection: true,
          },
        });
      }

      function getSubmitButtonLabel(mode) {
        switch (mode) {
          case 'createPipeline':
            return 'Add';
          case 'editPipeline':
            return 'Done';
          case 'clone':
            return 'Clone';
          default:
            return 'Create';
        }
      }

      function buildUpdateServerGroupCommand(serverGroup) {
        const command = {
          type: 'modifyAsg',
          asgs: [
            {
              asgName: serverGroup.name,
              region: serverGroup.region,
            },
          ],
          cooldown: serverGroup.asg.defaultCooldown,
          enabledMetrics: _.get(serverGroup, 'asg.enabledMetrics', []).map(m => m.metric),
          terminationPolicies: angular.copy(serverGroup.asg.terminationPolicies),
          credentials: serverGroup.account,
        };
        tencentCloudServerGroupConfigurationService.configureUpdateCommand(command);
        return command;
      }

      function buildServerGroupCommandFromExisting(application, serverGroup, mode = 'clone') {
        const preferredZonesLoader = AccountService.getPreferredZonesByAccount('tencentcloud');
        const subnetsLoader = SubnetReader.listSubnets();

        const serverGroupName = NameUtils.parseServerGroupName(serverGroup.asg.autoScalingGroupName);

        const instanceType = serverGroup.launchConfig ? serverGroup.launchConfig.instanceType : null;
        const instanceTypeCategoryLoader = instanceTypeService.getCategoryForInstanceType('tencentcloud', instanceType);

        const asyncLoader = $q.all({
          preferredZones: preferredZonesLoader,
          subnets: subnetsLoader,
          instanceProfile: instanceTypeCategoryLoader,
        });

        return asyncLoader.then(function(asyncData) {
          // These processes should never be copied over, as the affect launching instances and enabling traffic
          const enabledProcesses = ['Launch', 'Terminate', 'AddToLoadBalancer'];

          const applicationTencentCloudSettings = _.get(application, 'attributes.providerSettings.tencentcloud', {});
          const useAmiBlockDeviceMappings = applicationTencentCloudSettings.useAmiBlockDeviceMappings || false;

          const existingTags = {};
          // These tags are applied by Clouddriver (if configured to do so), regardless of what the user might enter
          // Might be worth feature flagging this if it turns out other folks are hard-coding these values
          const reservedTags = [
            'spinnaker:application',
            'spinnaker:stack',
            'spinnaker:details',
            'spinnaker:server-group-name',
          ];
          if (serverGroup.launchConfig.instanceTags) {
            serverGroup.launchConfig.instanceTags
              .filter(t => !reservedTags.includes(t.key))
              .forEach(tag => {
                existingTags[tag.key] = tag.value;
              });
          }
          const command = {
            application: application.name,
            strategy: '',
            stack: serverGroupName.stack,
            detail: serverGroupName.detail || serverGroupName.freeFormDetails,
            credentials: serverGroup.account,
            cooldown: serverGroup.asg.defaultCooldown,
            enabledMetrics: _.get(serverGroup, 'asg.enabledMetrics', []).map(m => m.metric),
            terminationPolicies: serverGroup.asg.terminationPolicySet,
            loadBalancers: serverGroup.asg.loadBalancerNames,
            loadBalancerId:
              serverGroup.loadBalancers && serverGroup.loadBalancers.length && serverGroup.loadBalancers[0],
            forwardLoadBalancers: serverGroup.asg.forwardLoadBalancerSet,
            region: serverGroup.region,
            useSourceCapacity: false,
            capacity: {
              min: serverGroup.asg.minSize,
              max: serverGroup.asg.maxSize,
              desired: serverGroup.asg.desiredCapacity,
            },
            targetHealthyDeployPercentage: 100,
            availabilityZones: [],
            selectedProvider: 'tencentcloud',
            source: {
              account: serverGroup.account,
              region: serverGroup.region,
              serverGroupName: serverGroup.asg.autoScalingGroupName,
            },
            suspendedProcesses: (serverGroup.asg.suspendedProcesses || [])
              .map(process => process.processName)
              .filter(name => !enabledProcesses.includes(name)),
            tags: Object.assign({}, serverGroup.tags, existingTags),
            targetGroups: serverGroup.targetGroups,
            useAmiBlockDeviceMappings: useAmiBlockDeviceMappings,
            copySourceCustomBlockDeviceMappings: mode === 'clone', // default to using block device mappings if not cloning
            viewState: {
              instanceProfile: asyncData.instanceProfile,
              useAllImageSelection: false,
              useSimpleCapacity: serverGroup.asg.minSize === serverGroup.asg.maxSize,
              usePreferredZones: [],
              mode: mode,
              submitButtonLabel: getSubmitButtonLabel(mode),
              isNew: false,
              dirty: {},
            },
          };

          if (
            application.attributes &&
            application.attributes.platformHealthOnlyShowOverride &&
            application.attributes.platformHealthOnly
          ) {
            command.interestingHealthProviderNames = ['Tencentcloud'];
          }

          if (mode === 'editPipeline') {
            command.useSourceCapacity = true;
            command.viewState.useSimpleCapacity = false;
            command.strategy = 'redblack';
            command.suspendedProcesses = [];
          }

          command.subnetIds = serverGroup.asg && serverGroup.asg.subnetIdSet;
          command.vpcId = serverGroup.asg.vpcId;

          if (serverGroup.launchConfig) {
            angular.extend(command, {
              instanceType: serverGroup.launchConfig.instanceType,
              keyPair:
                serverGroup.launchConfig.loginSettings.keyIds && serverGroup.launchConfig.loginSettings.keyIds[0],
              associatePublicIpAddress: serverGroup.launchConfig.internetAccessible.publicIpAssigned,
              ramdiskId: serverGroup.launchConfig.ramdiskId,
              enhancedService: serverGroup.launchConfig.enhancedService,
              ebsOptimized: serverGroup.launchConfig.ebsOptimized,
              internetAccessible: serverGroup.launchConfig.internetAccessible,
              systemDisk: serverGroup.launchConfig.systemDisk,
              dataDisks: serverGroup.launchConfig.dataDisks,
            });
            if (serverGroup.launchConfig.userData) {
              command.userData = serverGroup.launchConfig.userData;
            }
            command.viewState.imageId = serverGroup.launchConfig.imageId;
          }

          if (mode === 'clone' && serverGroup.image && serverGroup.image.name) {
            command.amiName = serverGroup.image.imageId;
          }

          if (serverGroup.launchConfig && serverGroup.launchConfig.securityGroupIds.length) {
            command.securityGroups = serverGroup.launchConfig.securityGroupIds;
          }
          return command;
        });
      }

      return {
        buildNewServerGroupCommand: buildNewServerGroupCommand,
        buildServerGroupCommandFromExisting: buildServerGroupCommandFromExisting,
        buildNewServerGroupCommandForPipeline: buildNewServerGroupCommandForPipeline,
        buildServerGroupCommandFromPipeline: buildServerGroupCommandFromPipeline,
        buildUpdateServerGroupCommand: buildUpdateServerGroupCommand,
      };
    },
  ]);
