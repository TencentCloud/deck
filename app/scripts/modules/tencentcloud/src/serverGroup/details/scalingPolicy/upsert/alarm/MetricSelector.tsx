import * as React from 'react';
import { SelectInput, HelpField } from '@spinnaker/core';

interface IMetricEditorProps {
  serverGroup: {
    name: string;
  };
  handleSelect: any;
  alarm: any;
}
export interface IMetricEditorState {
  advancedMode: boolean;
  selectedMetric: string;
  noDefaultMetrics?: boolean;
}

export default class MetricSelector extends React.Component<IMetricEditorProps, IMetricEditorState> {
  constructor(props: IMetricEditorProps) {
    super(props);
    this.state = {
      advancedMode: false,
      selectedMetric: this.metrics.find(metric => metric === props.alarm.metricName) || null,
    };
  }
  private metrics = [
    'CPU_UTILIZATION',
    'MEM_UTILIZATION',
    'LAN_TRAFFIC_OUT',
    'LAN_TRAFFIC_IN',
    'WAN_TRAFFIC_OUT',
    'WAN_TRAFFIC_IN',
  ];

  public simpleMode(): void {
    const { alarm } = this.props;
    alarm.dimensions = [{ name: 'AutoScalingGroupName', value: this.props.serverGroup.name }];
    this.props.handleSelect(alarm);
    this.setState(
      {
        advancedMode: false,
        selectedMetric: this.metrics.find(metric => metric === alarm.metricName) || null,
      },
      () => {
        this.metricChanged();
      },
    );
  }

  public metricChanged(): void {
    const { selectedMetric } = this.state;
    const { alarm } = this.props;
    if (selectedMetric) {
      alarm.metricName = selectedMetric;
    } else {
      alarm.namespace = null;
      alarm.metricName = null;
    }
    this.props.handleSelect(alarm);
  }

  private handleChanged = (selectedMetric: any) => {
    this.setState({ selectedMetric }, () => {
      this.metricChanged();
    });
  };

  render() {
    const { advancedMode, selectedMetric, noDefaultMetrics } = this.state;
    return (
      <>
        <div style={{ display: 'inline-block' }}>
          {!advancedMode && (
            <SelectInput
              required={true}
              className="form-control input-sm"
              options={this.metrics}
              value={selectedMetric}
              onChange={e => this.handleChanged(e.target.value)}
            />
          )}
          {advancedMode && this.metrics.length === 0 && (
            <span className="input-label" style={{ marginLeft: '5px' }}>
              <strong>Note:</strong> no metrics found for selected namespace + dimensions
            </span>
          )}
          <div style={{ padding: ' 0 0 0 5px' }}>
            {advancedMode && noDefaultMetrics && (
              <a className="small" onClick={this.simpleMode}>
                Only show metrics for this auto scaling group{' '}
                <HelpField id="tencentcloud.scalingPolicy.search.restricted" />
              </a>
            )}
          </div>
        </div>
      </>
    );
  }
}
