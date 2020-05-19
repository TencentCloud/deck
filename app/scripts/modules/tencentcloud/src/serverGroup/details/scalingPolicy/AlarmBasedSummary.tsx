import * as React from 'react';
import { IScalingPolicy } from 'tencentcloud/domain';
import { HoverablePopover, ConfirmationModalService } from '@spinnaker/core';
import ScalingPolicyPopover from './popover/ScalingPolicyPopover';
import { ScalingPolicyWriter } from './ScalingPolicyWriter';
interface Props {
  policy: IScalingPolicy;
  app: any;
  serverGroup: any;
}
interface State {}

export default class AlarmBasedSummary extends React.Component<Props, State> {
  state = {};

  private deletePolicy = () => {
    const { app: application, policy, serverGroup } = this.props;
    const taskMonitor = {
      application,
      title: 'Deleting scaling policy ' + policy.policyName,
      onTaskComplete: () => application.serverGroups.refresh(),
    };

    const submitMethod = () => ScalingPolicyWriter.deleteScalingPolicy(application, serverGroup, policy);

    ConfirmationModalService.confirm({
      header: 'Really delete ' + policy.scalingPolicyName + '?',
      buttonText: 'Delete scaling policy',
      account: serverGroup.account,
      taskMonitorConfig: taskMonitor,
      submitMethod: submitMethod,
    });
  };
  render() {
    const { policy } = this.props;
    return (
      <div style={{ marginBottom: 5 }}>
        <HoverablePopover
          placement="left"
          title={policy.scalingPolicyName}
          template={<ScalingPolicyPopover {...policy} />}
        >
          <span>{policy.scalingPolicyName}</span>
          {/* <div>
            <strong>Whenever </strong>
            {policy.metricAlarm.statistic} of
            <span className="alarm-name">{policy.metricAlarm.metricName}</span> is
            <span style={{ padding: '0 5px99' }}>{policy.metricAlarm.comparator}</span>
            {policy.metricAlarm.threshold}
          </div>
          <div>
            <strong>for at least </strong>
            {policy.metricAlarm.continuousTime} consecutive periods of {policy.metricAlarm.period} seconds
          </div> */}
        </HoverablePopover>
        {/* <button className="btn btn-xs btn-link" ng-if="$ctrl.policy.metricAlarm">
          <span className="glyphicon glyphicon-cog"></span>
          <span className="sr-only">Edit policy</span>
        </button> */}
        <button className="btn btn-xs btn-link" onClick={() => this.deletePolicy} ng-if="$ctrl.policy.metricAlarm">
          <span className="glyphicon glyphicon-trash" uib-tooltip="Delete policy"></span>
          <span className="sr-only">Delete policy</span>
        </button>
      </div>
    );
  }
}
