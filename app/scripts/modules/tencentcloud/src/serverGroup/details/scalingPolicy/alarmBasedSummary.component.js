'use strict';

const angular = require('angular');
import { ConfirmationModalService } from '@spinnaker/core';

import { SCALING_POLICY_POPOVER } from './popover/scalingPolicyPopover.component';
import { ScalingPolicyWriter } from './ScalingPolicyWriter';

import './scalingPolicySummary.component.less';
import { TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_UPSERTSCALINGPOLICY_CONTROLLER } from './upsert/upsertScalingPolicy.controller';

export const TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT =
  'spinnaker.tencentcloud.serverGroup.details.scalingPolicy.alarmBasedSummary.component';
angular
  .module(TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT, [
    TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_UPSERTSCALINGPOLICY_CONTROLLER,
    SCALING_POLICY_POPOVER,
  ])
  .component('tencentAlarmBasedSummary', {
    bindings: {
      policy: '=',
      serverGroup: '=',
      application: '=',
    },
    templateUrl: require('./alarmBasedSummary.component.html'),
    controller: [
      '$uibModal',
      'confirmationModalService',
      function($uibModal, confirmationModalService) {
        this.popoverTemplate = require('./popover/scalingPolicyDetails.popover.html');
        this.editPolicy = () => {
          $uibModal.open({
            templateUrl: require('./upsert/upsertScalingPolicy.modal.html'),
            controller: 'tencentUpsertScalingPolicyCtrl',
            controllerAs: 'ctrl',
            size: 'lg',
            resolve: {
              policy: () => this.policy,
              serverGroup: () => this.serverGroup,
              application: () => this.application,
            },
          });
        };

        this.deletePolicy = () => {
          const taskMonitor = {
            application: this.application,
            title: 'Deleting scaling policy ' + this.policy.policyName,
            onTaskComplete: () => this.application.serverGroups.refresh(),
          };

          const submitMethod = () =>
            ScalingPolicyWriter.deleteScalingPolicy(this.application, this.serverGroup, this.policy);

          ConfirmationModalService.confirm({
            header: 'Really delete ' + this.policy.scalingPolicyName + '?',
            buttonText: 'Delete scaling policy',
            account: this.serverGroup.account, // don't confirm if it's a junk policy
            provider: 'tencentcloud',
            taskMonitorConfig: taskMonitor,
            submitMethod: submitMethod,
          });
        };
      },
    ],
  });
