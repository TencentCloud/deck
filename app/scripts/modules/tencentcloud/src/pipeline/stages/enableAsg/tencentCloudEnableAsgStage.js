'use strict';

const angular = require('angular');

import { AccountService, Registry, StageConstants } from '@spinnaker/core';

export const TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG_TENCENTCLOUDENABLEASGSTAGE =
  'spinnaker.tencentcloud.pipeline.stage.enableAsgStage';
angular
  .module(TENCENTCLOUD_PIPELINE_STAGES_ENABLEASG_TENCENTCLOUDENABLEASGSTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'enableServerGroup',
      alias: 'enableAsg',
      cloudProvider: 'tencentcloud',
      templateUrl: require('./enableAsgStage.html'),
      executionStepLabelUrl: require('./enableAsgStepLabel.html'),
      validators: [
        {
          type: 'requiredField',
          fieldName: 'cluster',
        },
        {
          type: 'requiredField',
          fieldName: 'target',
        },
        {
          type: 'requiredField',
          fieldName: 'regions',
        },
        {
          type: 'requiredField',
          fieldName: 'credentials',
          fieldLabel: 'account',
        },
      ],
    });
  })
  .controller('tencentCloudEnableAsgStageCtrl', [
    '$scope',
    function($scope) {
      const ctrl = this;

      const stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('tencentcloud').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      ctrl.reset = () => {
        ctrl.accountUpdated();
        ctrl.resetSelectedCluster();
      };

      $scope.targets = StageConstants.TARGET_LIST;

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'tencentcloud';

      if (
        stage.isNew &&
        $scope.application.attributes.platformHealthOnlyShowOverride &&
        $scope.application.attributes.platformHealthOnly
      ) {
        stage.interestingHealthProviderNames = ['Tencentcloud'];
      }

      if (!stage.credentials && $scope.application.defaultCredentials.tencentcloud) {
        stage.credentials = $scope.application.defaultCredentials.tencentcloud;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.tencentcloud) {
        stage.regions.push($scope.application.defaultRegions.tencentcloud);
      }

      if (!stage.target) {
        stage.target = $scope.targets[0].val;
      }

      $scope.$watch('stage.credentials', $scope.accountUpdated);
    },
  ]);
