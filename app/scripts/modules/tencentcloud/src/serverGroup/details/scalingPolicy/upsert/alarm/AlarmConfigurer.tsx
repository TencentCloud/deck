import * as React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { SelectInput } from '@spinnaker/core';
import { statistics, comparators, periods } from './const';
import MetricSelector from './MetricSelector';
import './style.less';

interface Props {
  command: any;
  modalViewState: any;
  boundsChanged: any;
  serverGroup?: any;
}
interface State {
  multipleAlarmsAlert: boolean;
  alarmActionArnsAlert: boolean;
  command: any;
  modalViewState: any;
}

export default class AlarmConfigurer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      multipleAlarmsAlert: true,
      alarmActionArnsAlert: true,
      modalViewState: props.modalViewState,
      command: props.command,
    };
  }
  public componentDidMount() {
    this.alarmComparatorChanged();
  }

  private alarmComparatorChanged = () => {
    const { modalViewState, command } = this.state;
    const previousComparatorBound = modalViewState.comparatorBound;
    modalViewState.comparatorBound = command.alarm.comparisonOperator.indexOf('GREATER') === 0 ? 'max' : 'min';
    if (previousComparatorBound && modalViewState.comparatorBound !== previousComparatorBound && command.step) {
      command.step.stepAdjustments = [{ adjustmentValue: 1 }];
      this.setState({ modalViewState, command });
    }
    this.thresholdChanged(command);
  };

  private thresholdChanged = (command: any) => {
    const { modalViewState } = this.state;
    const source = modalViewState.comparatorBound === 'max' ? 'metricIntervalLowerBound' : 'metricIntervalUpperBound';
    if (command.step) {
      command.step.stepAdjustments[0][source] = command.alarm.threshold;
    }
    this.props.boundsChanged(command);
  };

  private handleChanged = (_key: any, value: any) => {
    const { command } = this.state;
    command.alarm[_key] = value;
    this.setState({ command }, () => {
      if (_key === 'comparisonOperator') {
        this.alarmComparatorChanged();
      }
      if (_key === 'threshold') {
        this.thresholdChanged(command);
      }
    });
  };
  private updatedMetic = (alarm: any) => {
    const { command } = this.state;
    command.alarm = Object.assign({ ...command.alarm, ...alarm });
    this.setState({
      command,
    });
    this.thresholdChanged(command);
  };

  render() {
    const {
      multipleAlarmsAlert,
      alarmActionArnsAlert,
      modalViewState,
      command: { alarm },
    } = this.state;
    return (
      <section className="alram-config">
        {modalViewState.multipleAlarms && multipleAlarmsAlert && (
          <Alert
            className="alert-warning"
            onDismiss={() => {
              this.setState({ multipleAlarmsAlert: false });
            }}
          >
            <p>
              <i className="fa fa-exclamation-triangle"></i> This scaling policy is configured with multiple alarms. You
              are only editing the first alarm.
            </p>
            <p>To edit or remove the additional alarms, you will need to use the tencentcloud cloud console.</p>
          </Alert>
        )}
        {alarm.alarmActionArns && alarmActionArnsAlert && (
          <Alert
            className="alert-warning"
            onDismiss={() => {
              this.setState({ alarmActionArnsAlert: false });
            }}
          >
            <p>
              <i className="fa fa-exclamation-triangle"></i> This alarm is used in multiple scaling policies. Any
              changes here will affect those other scaling policies.
            </p>
          </Alert>
        )}
        <Row>
          <Col md={2} className="sm-label-right">
            Whenever
          </Col>
          <Col md={10} className="content-fields">
            <SelectInput
              required={true}
              className="form-control input-sm"
              options={statistics}
              value={alarm.statistic}
              onChange={e => this.handleChanged('statistic', e.target.value)}
            />
            <span className="input-label">of</span>
            <MetricSelector serverGroup={this.props.serverGroup} alarm={alarm} handleSelect={this.updatedMetic} />
          </Col>
        </Row>
        <Row>
          <Col md={2} className="sm-label-right">
            is
          </Col>
          <Col md={10} className="content-fields">
            <SelectInput
              name="comparisonOperator"
              value={alarm.comparisonOperator}
              required={true}
              inputClassName="form-control input-sm"
              options={comparators}
              onChange={e => this.handleChanged('comparisonOperator', e.target.value)}
            />
            <input
              name="threshold"
              value={alarm.threshold}
              type="number"
              style={{ width: 100 }}
              className={`form-control input-sm no-spel`}
              onChange={e => this.handleChanged('threshold', e.target.value)}
            />
          </Col>
        </Row>
        <Row>
          <Col md={2} className="sm-label-right">
            for at least
          </Col>
          <Col md={10} className="content-fields">
            <input
              name="continuousTime"
              value={alarm.continuousTime}
              type="number"
              className="form-control input-sm"
              style={{ width: 50 }}
              onChange={e => this.handleChanged('continuousTime', e.target.value)}
            />
            <span className="input-label"> consecutive period(s) of </span>
            <SelectInput
              name="period"
              value={alarm.period}
              inputClassName="form-control input-sm"
              options={periods}
              onChange={e => this.handleChanged('period', e.target.value)}
            />
          </Col>
        </Row>
      </section>
    );
  }
}
