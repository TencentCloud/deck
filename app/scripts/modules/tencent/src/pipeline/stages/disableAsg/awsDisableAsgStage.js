'use strict';

const angular = require('angular');

import { AccountService, Registry, StageConstants } from '@spinnaker/core';

export const TENCENT_PIPELINE_STAGES_DISABLEASG_AWSDISABLEASGSTAGE = 'spinnaker.tencent.pipeline.stage.disableAsgStage';
export const name = TENCENT_PIPELINE_STAGES_DISABLEASG_AWSDISABLEASGSTAGE; // for backwards compatibility
angular
  .module(TENCENT_PIPELINE_STAGES_DISABLEASG_AWSDISABLEASGSTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'disableServerGroup',
      alias: 'disableAsg',
      cloudProvider: 'tencent',
      templateUrl: require('./disableAsgStage.html'),
      executionStepLabelUrl: require('./disableAsgStepLabel.html'),
      validators: [
        {
          type: 'targetImpedance',
          message:
            'This pipeline will attempt to disable a server group without deploying a new version into the same cluster.',
        },
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    });
  })
  .controller('tencentDisableAsgStageCtrl', [
    '$scope',
    function($scope) {
      const stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('tencent').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      $scope.targets = StageConstants.TARGET_LIST;

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'tencent';

      if (
        stage.isNew &&
        $scope.application.attributes.platformHealthOnlyShowOverride &&
        $scope.application.attributes.platformHealthOnly
      ) {
        stage.interestingHealthProviderNames = ['Tencent'];
      }

      if (!stage.credentials && $scope.application.defaultCredentials.tencent) {
        stage.credentials = $scope.application.defaultCredentials.tencent;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.tencent) {
        stage.regions.push($scope.application.defaultRegions.tencent);
      }

      if (!stage.target) {
        stage.target = $scope.targets[0].val;
      }
    },
  ]);
