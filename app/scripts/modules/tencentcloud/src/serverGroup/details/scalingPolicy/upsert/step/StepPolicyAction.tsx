import * as React from 'react';
import { SelectInput } from '@spinnaker/core';

interface Props {
  command: any;
  modalViewState: any;
  boundsChanged: any;
  operatorChanged: any;
}

interface State {
  multipleAlarmsAlert: boolean;
  alarmActionArnsAlert: boolean;
  command: any;
  viewState: any;
}

export default class StepPolicyAction extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      multipleAlarmsAlert: true,
      alarmActionArnsAlert: true,
      viewState: props.modalViewState,
      command: props.command,
    };
  }
  public componentDidMount() {
    this.adjustmentTypeChanged(this.props.modalViewState.adjustmentType);
  }
  private availableActions = ['Add', 'Remove', 'Set to'];

  private operatorChanged = (operator?: string) => {
    const { viewState } = this.state;
    if (operator) {
      viewState.operator = operator;
      this.props.operatorChanged(viewState);
    }
  };

  private adjustmentTypeChanged = (adjustmentType: string) => {
    const { viewState, command } = this.state;
    if (adjustmentType === 'instances') {
      command.adjustmentType = viewState.operator === 'Set to' ? 'EXACT_CAPACITY' : 'CHANGE_IN_CAPACITY';
    } else {
      command.adjustmentType = 'PERCENT_CHANGE_IN_CAPACITY';
    }
    viewState.adjustmentType = adjustmentType;
    this.setState({
      viewState,
    });
    this.props.boundsChanged(command);
  };

  // private addStep = () => {
  //   const { command } = this.state;
  //   command.step.stepAdjustments.push({ adjustmentValue: 1 });
  //   this.props.boundsChanged(command);
  // };

  private removeStep = (index: number) => {
    const { command } = this.state;
    command.step.stepAdjustments.splice(index, 1);
    this.props.boundsChanged(command);
  };

  private setMetricInterval = (index: number, value: any) => {
    const {
      command,
      viewState: { comparatorBound },
    } = this.state;
    const source = comparatorBound === 'min' ? 'metricIntervalLowerBound' : 'metricIntervalUpperBound';
    command.step.stepAdjustments[index][source] = value;
    this.props.boundsChanged(command);
  };

  setAdjustmentValue = (index: number, value: any) => {
    const { command } = this.state;
    command.step.stepAdjustments[index].adjustmentValue = value;
    this.props.boundsChanged(command);
  };

  render() {
    const {
      viewState: { adjustmentType, operator, comparatorBound },
      command: {
        step: { stepAdjustments },
        alarm,
      },
    } = this.state;
    const adjustmentTypeOptions = operator === 'Set to' ? ['instances'] : ['instances', 'percent of group'];
    return (
      <section className="policy-action">
        {stepAdjustments.map((item: any, index: number) => (
          <div key={index} style={{ margin: '0 0 10px 0' }}>
            {index === 0 ? (
              <SelectInput
                required={true}
                className="form-control input-sm"
                options={this.availableActions}
                value={operator}
                onChange={e => this.operatorChanged(e.target.value)}
                style={{ width: 65 }}
              />
            ) : (
              <span className="form-control-static select-placeholder" style={{ width: 75 }}>
                {operator}
              </span>
            )}
            <input
              min="0"
              required
              type="number"
              style={{ width: 65 }}
              className="form-control input-sm"
              value={item.adjustmentValue}
              onChange={e => this.setAdjustmentValue(index, e.target.value)}
            />
            {index === 0 ? (
              <SelectInput
                required={true}
                className="form-control input-sm"
                style={{ width: 110 }}
                options={adjustmentTypeOptions}
                value={adjustmentType}
                onChange={e => this.adjustmentTypeChanged(e.target.value)}
              />
            ) : (
              <span className="form-control-static select-placeholder" style={{ width: 120 }}>
                {adjustmentType}
              </span>
            )}

            <span className="input-label" style={{ padding: '0 5px' }}>
              when <strong>{alarm.metricName}</strong>
            </span>
            {comparatorBound === 'max' && (
              <>
                {index !== stepAdjustments.length - 1 ? (
                  <span className="input-label">
                    is between {item.metricIntervalLowerBound} and
                    <input
                      type="number"
                      name="metricIntervalUpperBound"
                      className="form-control input-sm"
                      onChange={e => this.setMetricInterval(index, e.target.value)}
                      required
                      min={item.metricIntervalLowerBound}
                      style={{ width: 85 }}
                    />
                  </span>
                ) : (
                  <span className="input-label">
                    is greater than
                    {(index !== 0 || alarm.comparisonOperator.includes('Equal')) && <span> or equal to</span>}{' '}
                    {item.metricIntervalLowerBound}
                  </span>
                )}
              </>
            )}

            {comparatorBound === 'min' && (
              <>
                {index !== stepAdjustments.length - 1 ? (
                  <span className="input-label">
                    is between
                    <input
                      type="number"
                      name="metricIntervalUpperBound"
                      className="form-control input-sm"
                      onChange={e => this.setMetricInterval(index, e.target.value)}
                      required
                      min={item.metricIntervalLowerBound}
                      style={{ width: 85 }}
                    />
                    and
                  </span>
                ) : (
                  <span className="input-label">
                    is less than
                    {(index !== 0 || alarm.comparisonOperator.includes('Equal')) && <span> or equal to</span>}{' '}
                    {item.metricIntervalUpperBound}
                  </span>
                )}
              </>
            )}
            {index !== 0 && (
              <span className="pull-right" style={{ padding: '5px 0' }}>
                <a
                  onClick={() => {
                    this.removeStep(index);
                  }}
                >
                  <span className="glyphicon glyphicon-trash"></span>
                </a>
              </span>
            )}
          </div>
        ))}
        {/* <button
          className="btn btn-block btn-sm add-new"
          onClick={() => {
            this.addStep();
          }}
        >
          <span className="glyphicon glyphicon-plus-sign"></span>
          Add step
        </button> */}

        <a href="https://cloud.tencentcloud.com/document/product/377/4166" target="_blank">
          <i className="far fa-file-alt"></i>
          Documentation
        </a>
      </section>
    );
  }
}
