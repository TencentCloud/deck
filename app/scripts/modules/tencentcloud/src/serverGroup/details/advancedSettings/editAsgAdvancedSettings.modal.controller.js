'use strict';

const angular = require('angular');

import { TaskExecutor, TaskMonitor } from '@spinnaker/core';
import { TENCENT_SERVERGROUP_CONFIGURE_SERVERGROUPCOMMANDBUILDER_SERVICE } from '../../configure/serverGroupCommandBuilder.service';

export const TENCENT_SERVERGROUP_DETAILS_ADVANCEDSETTINGS_EDITASGADVANCEDSETTINGS_MODAL_CONTROLLER =
  'spinnaker.tencentcloud.serverGroup.editAsgAdvancedSettings.modal.controller';
angular
  .module(TENCENT_SERVERGROUP_DETAILS_ADVANCEDSETTINGS_EDITASGADVANCEDSETTINGS_MODAL_CONTROLLER, [
    TENCENT_SERVERGROUP_CONFIGURE_SERVERGROUPCOMMANDBUILDER_SERVICE,
  ])
  .controller('tencentEditAsgAdvancedSettingsCtrl', [
    '$scope',
    '$uibModalInstance',
    'application',
    'serverGroup',
    'tencentServerGroupCommandBuilder',
    function($scope, $uibModalInstance, application, serverGroup, tencentServerGroupCommandBuilder) {
      $scope.command = tencentServerGroupCommandBuilder.buildUpdateServerGroupCommand(serverGroup);

      $scope.serverGroup = serverGroup;

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Update Advanced Settings for ' + serverGroup.name,
        modalInstance: $uibModalInstance,
        onTaskComplete: () => application.serverGroups.refresh(),
      });

      this.submit = () => {
        const job = [$scope.command];

        const submitMethod = function() {
          return TaskExecutor.executeTask({
            job: job,
            application: application,
            description: 'Update Advanced Settings for ' + serverGroup.name,
          });
        };

        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = $uibModalInstance.dismiss;
    },
  ]);
