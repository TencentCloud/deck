import * as React from 'react';
import { IScalingPolicy } from 'tencentcloud/domain';

interface Props {
  policy: IScalingPolicy;
}

interface State {}

export default class AlarmBasedSummary extends React.Component<Props, State> {
  state = {};

  render() {
    const { policy } = this.props;
    return (
      <>
        <div>
          <strong>Whenever </strong>
          {policy.metricAlarm.statistic} of
          <span className="alarm-name">{policy.metricAlarm.metricName}</span> is
          <span style={{ padding: '0 5px99' }}>{policy.metricAlarm.comparator}</span>
          {policy.metricAlarm.threshold}
        </div>
        <div>
          <strong>for at least </strong>
          {policy.metricAlarm.continuousTime} consecutive periods of {policy.metricAlarm.period} seconds
        </div>
      </>
    );
  }
}
