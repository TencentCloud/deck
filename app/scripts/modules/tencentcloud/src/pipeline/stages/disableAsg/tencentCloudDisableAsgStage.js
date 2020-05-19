'use strict';

const angular = require('angular');

import { AccountService, Registry, StageConstants } from '@spinnaker/core';

export const TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG_TENCENTCLOUDDISABLEASGSTAGE =
  'spinnaker.tencentcloud.pipeline.stage.disableAsgStage';
angular
  .module(TENCENTCLOUD_PIPELINE_STAGES_DISABLEASG_TENCENTCLOUDDISABLEASGSTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'disableServerGroup',
      alias: 'disableAsg',
      cloudProvider: 'tencentcloud',
      templateUrl: require('./disableAsgStage.html'),
      executionStepLabelUrl: require('./disableAsgStepLabel.html'),
      validators: [
        {
          type: 'targetImpedance',
          message:
            'This pipeline will attempt to disable a server group without deploying a new version into the same cluster.',
        },
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
  .controller('tencentCloudDisableAsgStageCtrl', [
    '$scope',
    function($scope) {
      const stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('tencentcloud').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

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
    },
  ]);
