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

export default class SimplePolicyAction extends React.Component<Props, State> {
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
    this.props.boundsChanged(command);
  };

  setAdjustmentValue = (value: any) => {
    const { command } = this.state;
    command.step.stepAdjustments[0].adjustmentValue = value;
    this.props.boundsChanged(command);
  };

  render() {
    const {
      viewState: { adjustmentType, operator },
    } = this.state;
    const adjustmentTypeOptions = operator === 'Set to' ? ['instances'] : ['instances', 'percent of group'];

    return (
      <section className="policy-action">
        <p>
          This is a simple scaling policy. To declare different actions based on the magnitude of the alarm,
          <strong>
            switch to a<a onClick={() => {}}>step policy</a>.
          </strong>
        </p>
        <SelectInput
          required
          className="form-control input-sm"
          options={this.availableActions}
          value={operator}
          onChange={e => this.operatorChanged(e.target.value)}
        />

        <input
          type="number"
          min="0"
          required
          className="form-control input-sm"
          style={{ width: 65 }}
          onChange={e => this.setAdjustmentValue(e.target.value)}
        />
        <SelectInput
          required
          className="form-control input-sm"
          options={adjustmentTypeOptions}
          value={adjustmentType}
          onChange={e => this.adjustmentTypeChanged(e.target.value)}
        />
      </section>
    );
  }
}
