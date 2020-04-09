'use strict';

const angular = require('angular');

import { TaskMonitor } from '@spinnaker/core';

import { STEP_POLICY_ACTION } from './step/stepPolicyAction.component';
import { ScalingPolicyWriter } from '../ScalingPolicyWriter';

import './upsertScalingPolicy.modal.less';
import EXPORTS_LOADER__N3_LINE_CHART__N3_CHARTS_BUILD_LINECHART from 'exports-loader?"n3-line-chart"!n3-charts/build/LineChart';
import { TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_SIMPLE_SIMPLEPOLICYACTION_COMPONENT } from './simple/simplePolicyAction.component';
import { TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_ALARM_ALARMCONFIGURER_COMPONENT } from './alarm/alarmConfigurer.component';

export const TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_UPSERTSCALINGPOLICY_CONTROLLER =
  'spinnaker.tencent.serverGroup.details.scalingPolicy.upsertScalingPolicy.controller';
angular
  .module(TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_UPSERTSCALINGPOLICY_CONTROLLER, [
    EXPORTS_LOADER__N3_LINE_CHART__N3_CHARTS_BUILD_LINECHART,
    TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_SIMPLE_SIMPLEPOLICYACTION_COMPONENT,
    STEP_POLICY_ACTION,
    TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_ALARM_ALARMCONFIGURER_COMPONENT,
  ])
  .controller('tencentUpsertScalingPolicyCtrl', [
    '$uibModalInstance',
    'serverGroup',
    'application',
    'policy',
    function($uibModalInstance, serverGroup, application, policy) {
      this.serverGroup = serverGroup;

      this.viewState = {
        isNew: !policy.autoScalingPolicyId,
        multipleAlarms: false,
        metricsLoaded: false,
        namespacesLoaded: false,
      };

      function createCommand() {
        return {
          application: application.name,
          name: policy.policyName,
          serverGroupName: serverGroup.name,
          credentials: serverGroup.account,
          region: serverGroup.region,
          provider: serverGroup.type,
          scalingPolicyId: policy.autoScalingPolicyId,
          adjustmentType: policy.adjustmentType,
          minAdjustmentMagnitude: policy.minAdjustmentMagnitude || 1,
        };
      }

      function initializeAlarm(command, policy) {
        const metricAlarm = policy.metricAlarm;
        command.alarm = {
          name: metricAlarm.alarmName,
          region: serverGroup.region,
          actionsEnabled: true,
          alarmDescription: metricAlarm.alarmDescription,
          comparisonOperator: metricAlarm.comparisonOperator,
          dimensions: metricAlarm.dimensions,
          continuousTime: metricAlarm.continuousTime,
          period: metricAlarm.period,
          threshold: metricAlarm.threshold,
          namespace: metricAlarm.namespace,
          metricName: metricAlarm.metricName,
          statistic: metricAlarm.statistic,
          unit: metricAlarm.unit,
          alarmActionArns: metricAlarm.alarmActions,
          insufficientDataActionArns: metricAlarm.insufficientDataActions,
          okActionArns: metricAlarm.okActions,
        };
      }

      this.initialize = () => {
        const command = createCommand();

        initializeAlarm(command, policy);

        if (command.adjustmentType === 'EXACT_CAPACITY') {
          this.viewState.operator = 'Set to';
          this.viewState.adjustmentType = 'instances';
        } else {
          let adjustmentBasis = policy.adjustmentValue;
          if (policy.stepAdjustments && policy.stepAdjustments.length) {
            adjustmentBasis = policy.stepAdjustments[0].adjustmentValue;
          }
          this.viewState.operator = adjustmentBasis > 0 ? 'Add' : 'Remove';
          this.viewState.adjustmentType =
            policy.adjustmentType === 'CHANGE_IN_CAPACITY' ? 'instances' : 'percent of group';
        }

        initializeStepPolicy(command, policy);

        this.command = command;
      };

      function initializeStepPolicy(command, policy) {
        const threshold = command.alarm.threshold;
        command.step = {
          estimatedInstanceWarmup: policy.estimatedInstanceWarmup || command.cooldown || 600,
          metricAggregationType: 'AVERAGE',
        };
        command.step.stepAdjustments = (
          policy.stepAdjustments || [
            {
              adjustmentValue: policy.adjustmentValue,
            },
          ]
        ).map(adjustment => {
          const step = {
            adjustmentValue: Math.abs(adjustment.adjustmentValue),
          };
          if (adjustment.metricIntervalUpperBound !== undefined) {
            step.metricIntervalUpperBound = adjustment.metricIntervalUpperBound + threshold;
          }
          if (adjustment.metricIntervalLowerBound !== undefined) {
            step.metricIntervalLowerBound = adjustment.metricIntervalLowerBound + threshold;
          }
          return step;
        });
      }

      function initializeSimplePolicy(command, policy) {
        command.simple = {
          cooldown: policy.cooldown || 600,
          adjustmentValue: Math.abs(policy.adjustmentValue) || 1,
        };
      }

      this.boundsChanged = () => {
        const source =
          this.viewState.comparatorBound === 'min' ? 'metricIntervalLowerBound' : 'metricIntervalUpperBound';
        const target = source === 'metricIntervalLowerBound' ? 'metricIntervalUpperBound' : 'metricIntervalLowerBound';

        if (this.command.step) {
          const steps = this.command.step.stepAdjustments;
          steps.forEach((step, index) => {
            if (steps.length > index + 1) {
              steps[index + 1][target] = step[source];
            }
          });
          // remove the source boundary from the last step
          delete steps[steps.length - 1][source];
        }
      };

      this.switchMode = () => {
        const command = this.command;
        const cooldownOrWarmup = command.step ? command.step.estimatedInstanceWarmup : command.simple.cooldown;
        if (command.step) {
          const policy = { cooldown: cooldownOrWarmup };
          delete command.step;
          initializeSimplePolicy(command, policy);
        } else {
          const stepAdjustments = [
            {
              adjustmentValue: command.simple.adjustmentValue,
            },
          ];
          if (this.viewState.comparatorBound === 'min') {
            stepAdjustments[0].metricIntervalUpperBound = 0;
          } else {
            stepAdjustments[0].metricIntervalLowerBound = 0;
          }
          delete command.simple;
          initializeStepPolicy(command, {
            estimatedInstanceWarmup: cooldownOrWarmup,
            stepAdjustments: stepAdjustments,
          });
          this.boundsChanged();
        }
      };

      this.action = this.viewState.isNew ? 'Create' : 'Edit';

      const prepareCommandForSubmit = () => {
        const command = _.cloneDeep(this.command);

        if (command.adjustmentType !== 'PERCENT_CHANGE_IN_CAPACITY') {
          delete command.minAdjustmentMagnitude;
        }

        if (command.step) {
          command.step.stepAdjustments.forEach(step => {
            if (this.viewState.operator === 'Remove') {
              step.adjustmentValue = 0 - step.adjustmentValue;
              delete command.step.estimatedInstanceWarmup;
            }
            if (step.metricIntervalLowerBound !== undefined) {
              step.metricIntervalLowerBound -= command.alarm.threshold;
            }
            if (step.metricIntervalUpperBound !== undefined) {
              step.metricIntervalUpperBound -= command.alarm.threshold;
            }
          });
        } else {
          if (this.viewState.operator === 'Remove') {
            command.simple.adjustmentValue = 0 - command.simple.adjustmentValue;
          }
        }
        return {
          application: command.application,
          accountName: command.credentials,
          credentials: command.credentials,
          region: command.region,
          cloudProvider: 'tencent',
          serverGroupName: command.serverGroupName,
          operationType: this.viewState.isNew ? 'CREATE' : 'MODIFY',
          scalingPolicyId: command.scalingPolicyId,
          adjustmentType: command.adjustmentType,
          adjustmentValue: command.step.stepAdjustments[0] && command.step.stepAdjustments[0].adjustmentValue,
          metricAlarm: {
            comparisonOperator: command.alarm.comparisonOperator,
            metricName: command.alarm.metricName,
            threshold: command.alarm.threshold,
            period: command.alarm.period,
            continuousTime: command.alarm.continuousTime,
            statistic: command.alarm.statistic,
          },
          // cooldown: 60
        };
      };

      this.taskMonitor = new TaskMonitor({
        application: application,
        title: this.action + ' scaling policy for ' + serverGroup.name,
        modalInstance: $uibModalInstance,
        onTaskComplete: () => application.serverGroups.refresh(),
      });

      this.save = () => {
        const command = prepareCommandForSubmit();
        const submitMethod = () => ScalingPolicyWriter.upsertScalingPolicy(application, command);

        this.taskMonitor.submit(submitMethod);
      };

      this.cancel = $uibModalInstance.dismiss;

      this.initialize();
    },
  ]);
