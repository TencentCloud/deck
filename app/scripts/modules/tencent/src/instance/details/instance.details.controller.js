'use strict';

const angular = require('angular');
import _ from 'lodash';

import { CloudProviderRegistry, InstanceReader, RecentHistoryService, SETTINGS, FirewallLabels } from '@spinnaker/core';

import { TENCENTCLOUD_INSTANCE_WRITE_SERVICE } from '../tencentCloud.instance.write.service';
import { default as UIROUTER_ANGULARJS } from '@uirouter/angularjs';
import ANGULAR_UI_BOOTSTRAP from 'angular-ui-bootstrap';
import { TENCENT_VPC_VPCTAG_DIRECTIVE } from '../../vpc/vpcTag.directive';

export const TENCENT_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER = 'spinnaker.tencent.instance.details.controller';
angular
  .module(TENCENT_INSTANCE_DETAILS_INSTANCE_DETAILS_CONTROLLER, [
    UIROUTER_ANGULARJS,
    ANGULAR_UI_BOOTSTRAP,
    TENCENTCLOUD_INSTANCE_WRITE_SERVICE,
    TENCENT_VPC_VPCTAG_DIRECTIVE,
  ])
  .controller('tencentInstanceDetailsCtrl', [
    '$scope',
    '$state',
    '$uibModal',
    'tencentCloudInstanceWriter',
    'confirmationModalService',
    'instance',
    'app',
    'moniker',
    'environment',
    '$q',
    'overrides',
    function(
      $scope,
      $state,
      $uibModal,
      tencentCloudInstanceWriter,
      confirmationModalService,
      instance,
      app,
      moniker,
      environment,
      $q,
      overrides,
    ) {
      // needed for standalone instances
      $scope.detailsTemplateUrl = CloudProviderRegistry.getValue('tencent', 'instance.detailsTemplateUrl');

      $scope.state = {
        loading: true,
        standalone: app.isStandalone,
        instancePort: _.get(app, 'attributes.instancePort') || SETTINGS.defaultInstancePort || 80,
      };

      $scope.application = app;
      $scope.moniker = moniker;
      $scope.environment = environment;

      $scope.securityGroupsLabel = FirewallLabels.get('Firewalls');

      function extractHealthMetrics(instance, latest) {
        // do not backfill on standalone instances
        if (app.isStandalone) {
          instance.health = latest.health;
        }

        instance.health = instance.health || [];
        const displayableMetrics = instance.health.filter(function(metric) {
          return metric.type !== 'Tencent' || metric.state !== 'Unknown';
        });
        // backfill details where applicable
        if (latest.health) {
          displayableMetrics.forEach(function(metric) {
            const detailsMatch = latest.health.filter(function(latestHealth) {
              return latestHealth.type === metric.type;
            });
            if (detailsMatch.length) {
              _.defaults(metric, detailsMatch[0]);
            }
          });
        }
        $scope.healthMetrics = displayableMetrics;
      }

      function retrieveInstance() {
        const extraData = {};
        let instanceSummary, loadBalancers, targetGroups, account, region;
        if (!app.serverGroups) {
          // standalone instance
          instanceSummary = {};
          loadBalancers = [];
          targetGroups = [];
          account = instance.account;
          region = instance.region;
        } else {
          app.serverGroups.data.some(function(serverGroup) {
            return serverGroup.instances.some(function(possibleInstance) {
              if (possibleInstance.id === instance.instanceId) {
                instanceSummary = possibleInstance;
                loadBalancers = serverGroup.loadBalancers;
                targetGroups = serverGroup.targetGroups;
                account = serverGroup.account;
                region = serverGroup.region;
                extraData.serverGroup = serverGroup.name;
                extraData.vpcId = serverGroup.vpcId;
                return true;
              }
            });
          });
          if (!instanceSummary) {
            // perhaps it is in a server group that is part of another app
            app.loadBalancers.data.some(function(loadBalancer) {
              return (
                loadBalancer.instances.some(function(possibleInstance) {
                  if (possibleInstance.id === instance.instanceId) {
                    instanceSummary = possibleInstance;
                    loadBalancers = [loadBalancer.name];
                    account = loadBalancer.account;
                    region = loadBalancer.region;
                    return true;
                  }
                }) ||
                (loadBalancer.targetGroups &&
                  loadBalancer.targetGroups.some(function(targetGroup) {
                    return targetGroup.instances.some(function(possibleInstance) {
                      if (possibleInstance.id === instance.instanceId) {
                        instanceSummary = possibleInstance;
                        targetGroups = [targetGroup.name];
                        account = loadBalancer.account;
                        region = loadBalancer.region;
                        return true;
                      }
                    });
                  }))
              );
            });
            if (!instanceSummary) {
              // perhaps it is in a disabled server group via a load balancer
              app.loadBalancers.data.some(function(loadBalancer) {
                return (
                  loadBalancer.serverGroups.some(function(serverGroup) {
                    if (!serverGroup.isDisabled) {
                      return false;
                    }
                    return serverGroup.instances.some(function(possibleInstance) {
                      if (possibleInstance.id === instance.instanceId) {
                        instanceSummary = possibleInstance;
                        loadBalancers = [loadBalancer.name];
                        account = loadBalancer.account;
                        region = loadBalancer.region;
                        return true;
                      }
                    });
                  }) ||
                  loadBalancer.targetGroups.some(function(targetGroup) {
                    targetGroup.serverGroups.some(function(serverGroup) {
                      if (!serverGroup.isDisabled) {
                        return false;
                      }
                      return serverGroup.instances.some(function(possibleInstance) {
                        if (possibleInstance.id === instance.instanceId) {
                          instanceSummary = possibleInstance;
                          loadBalancers = [loadBalancer.name];
                          account = loadBalancer.account;
                          region = loadBalancer.region;
                          return true;
                        }
                      });
                    });
                  })
                );
              });
            }
          }
        }

        if (instanceSummary && account && region) {
          extraData.account = account;
          extraData.region = region;
          RecentHistoryService.addExtraDataToLatest('instances', extraData);
          return InstanceReader.getInstanceDetails(account, region, instance.instanceId).then(details => {
            if ($scope.$$destroyed) {
              return;
            }
            $scope.state.loading = false;
            extractHealthMetrics(instanceSummary, details);
            $scope.instance = _.defaults(details, instanceSummary);
            $scope.instance.instanceId = details.id;
            $scope.instance.account = account;
            $scope.instance.region = region;
            $scope.instance.vpcId = details.vpcId;
            $scope.instance.loadBalancers = loadBalancers;
            $scope.instance.targetGroups = targetGroups;
            if ($scope.instance.networkInterfaces) {
              const permanentNetworkInterfaces = $scope.instance.networkInterfaces.filter(
                f => f.attachment.deleteOnTermination === false,
              );
              if (permanentNetworkInterfaces.length) {
                $scope.instance.permanentIps = permanentNetworkInterfaces.map(f => f.privateIpAddress);
              }
            }
            $scope.baseIpAddress = details.publicDnsName || details.privateIpAddress;
            if (overrides.instanceDetailsLoaded) {
              overrides.instanceDetailsLoaded();
            }
          }, autoClose);
        }

        if (!instanceSummary) {
          $scope.instanceIdNotFound = instance.instanceId;
          $scope.state.loading = false;
        }

        return $q.when(null);
      }

      function autoClose() {
        if ($scope.$$destroyed) {
          return;
        }
        if (app.isStandalone) {
          $scope.state.loading = false;
          $scope.instanceIdNotFound = instance.instanceId;
          $scope.state.notFoundStandalone = true;
          RecentHistoryService.removeLastItem('instances');
        } else {
          $state.go('^', { allowModalToStayOpen: true }, { location: 'replace' });
        }
      }

      this.canDeregisterFromLoadBalancer = function() {
        const healthMetrics = $scope.instance.health || [];
        return healthMetrics.some(function(health) {
          return health.type === 'LoadBalancer';
        });
      };

      this.canRegisterWithLoadBalancer = function() {
        const instance = $scope.instance;
        const healthMetrics = instance.health || [];
        if (!instance.loadBalancers || !instance.loadBalancers.length) {
          return false;
        }
        const outOfService = healthMetrics.some(function(health) {
          return health.type === 'LoadBalancer' && health.state === 'OutOfService';
        });
        const hasLoadBalancerHealth = healthMetrics.some(function(health) {
          return health.type === 'LoadBalancer';
        });
        return outOfService || !hasLoadBalancerHealth;
      };

      this.canDeregisterFromTargetGroup = function() {
        const healthMetrics = $scope.instance.health || [];
        return healthMetrics.some(function(health) {
          return health.type === 'TargetGroup' && health.state !== 'OutOfService';
        });
      };

      this.canRegisterWithTargetGroup = function() {
        const instance = $scope.instance;
        const healthMetrics = instance.health || [];
        if (!instance.targetGroups || !instance.targetGroups.length) {
          return false;
        }
        const outOfService = healthMetrics.some(function(health) {
          return health.type === 'TargetGroup' && health.state === 'OutOfService';
        });
        const hasTargetGroupHealth = healthMetrics.some(function(health) {
          return health.type === 'TargetGroup';
        });
        return outOfService || !hasTargetGroupHealth;
      };

      this.canRegisterWithDiscovery = function() {
        const instance = $scope.instance;
        const healthMetrics = instance.health || [];
        const discoveryHealth = healthMetrics.filter(function(health) {
          return health.type === 'Discovery';
        });
        return discoveryHealth.length ? discoveryHealth[0].state === 'OutOfService' : false;
      };

      this.terminateInstance = function terminateInstance() {
        const instance = $scope.instance;

        const taskMonitor = {
          application: app,
          title: 'Terminating ' + instance.instanceId,
          onTaskComplete: function() {
            if ($state.includes('**.instanceDetails', { instanceId: instance.instanceId })) {
              $state.go('^');
            }
          },
        };

        const submitMethod = function() {
          return tencentCloudInstanceWriter.terminateInstance(instance, app, {
            cloudProvider: instance.cloudProvider,
            serverGroupName: instance.serverGroupName,
          });
        };

        confirmationModalService.confirm({
          header: 'Really terminate ' + instance.instanceId + '?',
          buttonText: 'Terminate ' + instance.instanceId,
          account: instance.account,
          provider: 'tencent',
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.terminateInstanceAndShrinkServerGroup = function terminateInstanceAndShrinkServerGroup() {
        const instance = $scope.instance;

        const taskMonitor = {
          application: app,
          title: 'Terminating ' + instance.instanceId + ' and shrinking server group',
          onTaskComplete: function() {
            if ($state.includes('**.instanceDetails', { instanceId: instance.instanceId })) {
              $state.go('^');
            }
          },
        };

        const submitMethod = function() {
          return tencentCloudInstanceWriter.terminateInstanceAndShrinkServerGroup(instance, app, {
            instanceIds: [instance.id],
            cloudProvider: instance.cloudProvider,
            serverGroupName: instance.serverGroupName,
          });
        };

        confirmationModalService.confirm({
          header: 'Really terminate ' + instance.instanceId + ' and shrink ' + instance.serverGroup + '?',
          buttonText: 'Terminate ' + instance.instanceId + ' and shrink ' + instance.serverGroup,
          account: instance.account,
          provider: 'tencent',
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.rebootInstance = function rebootInstance() {
        const instance = $scope.instance;

        const taskMonitor = {
          application: app,
          title: 'Rebooting ' + instance.instanceId,
        };

        const submitMethod = (params = {}) => {
          if (app.attributes && app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
            params.interestingHealthProviderNames = ['Tencent'];
          }

          return tencentCloudInstanceWriter.rebootInstance(instance, app, params);
        };

        confirmationModalService.confirm({
          header: 'Really reboot ' + instance.instanceId + '?',
          buttonText: 'Reboot ' + instance.instanceId,
          account: instance.account,
          provider: 'tencent',
          platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
          platformHealthType: 'Tencent',
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.registerInstanceWithLoadBalancer = function registerInstanceWithLoadBalancer() {
        const instance = $scope.instance;
        const loadBalancerNames = instance.loadBalancers.join(' and ');

        const taskMonitor = {
          application: app,
          title: 'Registering ' + instance.instanceId + ' with ' + loadBalancerNames,
        };

        const submitMethod = function() {
          return tencentCloudInstanceWriter.registerInstanceWithLoadBalancer(instance, app);
        };

        confirmationModalService.confirm({
          header: 'Really register ' + instance.instanceId + ' with ' + loadBalancerNames + '?',
          buttonText: 'Register ' + instance.instanceId,
          account: instance.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.deregisterInstanceFromLoadBalancer = function deregisterInstanceFromLoadBalancer() {
        const instance = $scope.instance;
        const loadBalancerNames = instance.loadBalancers.join(' and ');

        const taskMonitor = {
          application: app,
          title: 'Deregistering ' + instance.instanceId + ' from ' + loadBalancerNames,
        };

        const submitMethod = function() {
          return tencentCloudInstanceWriter.deregisterInstanceFromLoadBalancer(instance, app);
        };

        confirmationModalService.confirm({
          header: 'Really deregister ' + instance.instanceId + ' from ' + loadBalancerNames + '?',
          buttonText: 'Deregister ' + instance.instanceId,
          provider: 'tencent',
          account: instance.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.registerInstanceWithTargetGroup = function registerInstanceWithTargetGroup() {
        const instance = $scope.instance;
        const targetGroupNames = instance.targetGroups.join(' and ');

        const taskMonitor = {
          application: app,
          title: 'Registering ' + instance.instanceId + ' with ' + targetGroupNames,
        };

        const submitMethod = function() {
          return tencentCloudInstanceWriter.registerInstanceWithTargetGroup(instance, app);
        };

        confirmationModalService.confirm({
          header: 'Really register ' + instance.instanceId + ' with ' + targetGroupNames + '?',
          buttonText: 'Register ' + instance.instanceId,
          account: instance.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.deregisterInstanceFromTargetGroup = function deregisterInstanceFromTargetGroup() {
        const instance = $scope.instance;
        const targetGroupNames = instance.targetGroups.join(' and ');

        const taskMonitor = {
          application: app,
          title: 'Deregistering ' + instance.instanceId + ' from ' + targetGroupNames,
        };

        const submitMethod = function() {
          return tencentCloudInstanceWriter.deregisterInstanceFromTargetGroup(instance, app);
        };

        confirmationModalService.confirm({
          header: 'Really deregister ' + instance.instanceId + ' from ' + targetGroupNames + '?',
          buttonText: 'Deregister ' + instance.instanceId,
          provider: 'tencent',
          account: instance.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.enableInstanceInDiscovery = function enableInstanceInDiscovery() {
        const instance = $scope.instance;

        const taskMonitor = {
          application: app,
          title: 'Enabling ' + instance.instanceId + ' in discovery',
        };

        const submitMethod = function() {
          return tencentCloudInstanceWriter.enableInstanceInDiscovery(instance, app);
        };

        confirmationModalService.confirm({
          header: 'Really enable ' + instance.instanceId + ' in discovery?',
          buttonText: 'Enable ' + instance.instanceId,
          account: instance.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.disableInstanceInDiscovery = function disableInstanceInDiscovery() {
        const instance = $scope.instance;

        const taskMonitor = {
          application: app,
          title: 'Disabling ' + instance.instanceId + ' in discovery',
        };

        const submitMethod = function() {
          return tencentCloudInstanceWriter.disableInstanceInDiscovery(instance, app);
        };

        confirmationModalService.confirm({
          header: 'Really disable ' + instance.instanceId + ' in discovery?',
          buttonText: 'Disable ' + instance.instanceId,
          provider: 'tencent',
          account: instance.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.hasHealthState = function hasHealthState(healthProviderType, state) {
        const instance = $scope.instance;
        const healthMetrics = instance.health || [];
        return healthMetrics.some(function(health) {
          return health.type === healthProviderType && health.state === state;
        });
      };

      const initialize = app.isStandalone
        ? retrieveInstance()
        : $q.all([app.serverGroups.ready(), app.loadBalancers.ready()]).then(retrieveInstance);

      initialize.then(() => {
        // Two things to look out for here:
        //  1. If the retrieveInstance call completes *after* the user has navigated away from the view, there
        //     is no point in subscribing to the refresh
        //  2. If this is a standalone instance, there is no application that will refresh
        if (!$scope.$$destroyed && !app.isStandalone) {
          app.serverGroups.onRefresh($scope, retrieveInstance);
        }
      });

      $scope.account = instance.account;
    },
  ]);
