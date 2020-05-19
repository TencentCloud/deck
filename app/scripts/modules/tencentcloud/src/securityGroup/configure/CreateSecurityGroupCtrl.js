'use strict';

const angular = require('angular');

import { CACHE_INITIALIZER_SERVICE, FirewallLabels } from '@spinnaker/core';
import { default as UIROUTER_ANGULARJS } from '@uirouter/angularjs';

export const TENCENTCLOUD_SECURITYGROUP_CONFIGURE_CREATESECURITYGROUPCTRL =
  'spinnaker.tencentcloud.securityGroup.create.controller';
angular
  .module(TENCENTCLOUD_SECURITYGROUP_CONFIGURE_CREATESECURITYGROUPCTRL, [UIROUTER_ANGULARJS, CACHE_INITIALIZER_SERVICE])
  .controller('tencentCloudCreateSecurityGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    '$state',
    '$controller',
    'cacheInitializer',
    'application',
    'securityGroup',
    function($scope, $uibModalInstance, $state, $controller, cacheInitializer, application, securityGroup) {
      $scope.pages = {
        location: require('./createSecurityGroupProperties.html'),
        ingress: require('./createSecurityGroupIngress.html'),
      };
      $scope.regionFilters = [];
      const ctrl = this;

      ctrl.translate = label => FirewallLabels.get(label);
      ctrl.protocolChange = rule => {
        if (rule.protocol == 'ICMP') {
          rule.port = '';
        }
      };
      angular.extend(
        this,
        $controller('tencentCloudConfigSecurityGroupMixin', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          application: application,
          securityGroup: securityGroup,
        }),
      );

      $scope.state.isNew = true;

      ctrl.upsert = () => ctrl.mixinUpsert('Create');

      ctrl.initializeSecurityGroups().then(ctrl.initializeAccounts);
    },
  ]);
