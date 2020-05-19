import * as React from 'react';
import { IScalingPolicy } from 'tencentcloud/domain';
import { HoverablePopover } from '@spinnaker/core';
import ScalingPolicyPopover from './popover/ScalingPolicyPopover';
interface Props {
  policy: IScalingPolicy;
}
interface State {}

export default class AlarmBasedSummary extends React.Component<Props, State> {
  state = {};
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
        <button className="btn btn-xs btn-link" ng-click="$ctrl.editPolicy()" ng-if="$ctrl.policy.metricAlarm">
          <span className="glyphicon glyphicon-cog"></span>
          <span className="sr-only">Edit policy</span>
        </button>
        <button className="btn btn-xs btn-link" ng-click="$ctrl.deletePolicy()" ng-if="$ctrl.policy.metricAlarm">
          <span className="glyphicon glyphicon-trash" uib-tooltip="Delete policy"></span>
          <span className="sr-only">Delete policy</span>
        </button>
      </div>
    );
  }
}
