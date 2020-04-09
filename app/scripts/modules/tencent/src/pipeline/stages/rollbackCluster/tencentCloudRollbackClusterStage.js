'use strict';

const angular = require('angular');

import { AccountService, Registry } from '@spinnaker/core';

export const TENCENT_PIPELINE_STAGES_ROLLBACKCLUSTER_TENCENTCLOUDROLLBACKCLUSTERSTAGE =
  'spinnaker.tencent.pipeline.stage.rollbackClusterStage';
angular
  .module(TENCENT_PIPELINE_STAGES_ROLLBACKCLUSTER_TENCENTCLOUDROLLBACKCLUSTERSTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'rollbackCluster',
      cloudProvider: 'tencent',
      templateUrl: require('./rollbackClusterStage.html'),
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    });
  })
  .controller('tencentRollbackClusterStageCtrl', [
    '$scope',
    function($scope) {
      const ctrl = this;

      const stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('tencent').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      ctrl.reset = () => {
        ctrl.accountUpdated();
        ctrl.resetSelectedCluster();
      };

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'tencent';
      stage.targetHealthyRollbackPercentage = stage.targetHealthyRollbackPercentage || 100;

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
    },
  ]);
