import * as React from 'react';
import _ from 'lodash';
import { ReactModal, WizardModal, WizardPage, noop, TaskMonitor } from '@spinnaker/core';
import { ScalingPolicyWriter } from '../ScalingPolicyWriter';
import { IScalingPolicy } from 'tencentcloud/domain';
import AlarmConfigurer from './alarm/AlarmConfigurer';
import SimplePolicyAction from './simple/SimplePolicyAction';
import StepPolicyAction from './step/StepPolicyAction';
interface UpsertScalingPlicyModalProps {
  application?: any;
  serverGroup?: any;
  closeModal?(result?: any): void;
  dismissModal?(rejection?: any): void;
  policy: IScalingPolicy;
}

interface UpsertScalingPlicyModalState {
  taskMonitor: TaskMonitor;
  command: any;
  viewState: {
    isNew: boolean;
    multipleAlarms: boolean;
    metricsLoaded: boolean;
    namespacesLoaded: boolean;
    operator: string;
    adjustmentType: string;
    comparatorBound: string;
  };
}

export default class UpsertScalingPlicyModal extends React.Component<
  UpsertScalingPlicyModalProps,
  UpsertScalingPlicyModalState
> {
  public static defaultProps: Partial<UpsertScalingPlicyModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static show(props: UpsertScalingPlicyModalProps): Promise<void> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(UpsertScalingPlicyModal, props, modalProps);
  }

  constructor(props: UpsertScalingPlicyModalProps) {
    super(props);
    const { serverGroup, application, policy } = this.props;
    this.state = {
      taskMonitor: new TaskMonitor({
        application,
        title: 'Update Auto Scaling Processes for ' + serverGroup.name,
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
        onTaskComplete: () => application.serverGroups.refresh(),
        onTaskRetry: () => {
          this.setState({
            taskMonitor: null,
          });
        },
      }),
      viewState: {
        isNew: !policy.autoScalingPolicyId,
        multipleAlarms: false,
        metricsLoaded: false,
        namespacesLoaded: false,
        operator: '',
        adjustmentType: '',
        comparatorBound: '',
      },
      command: {},
    };
  }

  componentDidMount() {
    this.initialize();
  }

  private initializeAlarm = () => {
    const {
      policy: { metricAlarm },
      serverGroup,
    } = this.props;
    return {
      name: metricAlarm.alarmName,
      region: serverGroup.region,
      actionsEnabled: true,
      ...metricAlarm,
    };
  };

  private initializeStepPolicy = (
    alarm: { threshold?: any },
    policy: {
      estimatedInstanceWarmup?: any;
      cooldown?: any;
      stepAdjustments?: any;
      adjustmentValue?: any;
    },
  ) => {
    const threshold = alarm.threshold;
    const step = {
      estimatedInstanceWarmup: policy.estimatedInstanceWarmup || policy.cooldown || 600, // cooldown 取值有待
      metricAggregationType: 'AVERAGE',
      stepAdjustments: (
        policy.stepAdjustments || [
          {
            adjustmentValue: policy.adjustmentValue,
          },
        ]
      ).map((adjustment: { adjustmentValue: number; metricIntervalUpperBound: any; metricIntervalLowerBound: any }) => {
        const _step = {
          adjustmentValue: Math.abs(adjustment.adjustmentValue),
          metricIntervalUpperBound: '',
          metricIntervalLowerBound: '',
        };
        if (adjustment.metricIntervalUpperBound !== undefined) {
          _step.metricIntervalUpperBound = adjustment.metricIntervalUpperBound + threshold;
        }
        if (adjustment.metricIntervalLowerBound !== undefined) {
          _step.metricIntervalLowerBound = adjustment.metricIntervalLowerBound + threshold;
        }
        return _step;
      }),
    };
    return step;
  };

  initializeSimplePolicy = (policy: { cooldown: any }) => {
    return {
      cooldown: policy.cooldown || 600,
      adjustmentValue: 1,
    };
  };
  private initialize = () => {
    const { viewState } = this.state;
    const {
      policy: { adjustmentValue, stepAdjustments, adjustmentType, metricAlarm },
    } = this.props;
    const command = {
      alarm: this.initializeAlarm(),
      step: this.initializeStepPolicy(metricAlarm, this.props.policy),
    };

    if (adjustmentType === 'EXACT_CAPACITY') {
      viewState.operator = 'Set to';
      viewState.adjustmentType = 'instances';
    } else {
      let adjustmentBasis = adjustmentValue;
      if (stepAdjustments && stepAdjustments.length) {
        adjustmentBasis = stepAdjustments[0].adjustmentValue;
      }
      viewState.operator = adjustmentBasis > 0 ? 'Add' : 'Remove';
      viewState.adjustmentType = adjustmentType === 'CHANGE_IN_CAPACITY' ? 'instances' : 'percent of group';
    }
    this.setState({
      viewState,
      command,
    });
  };

  boundsChanged = (command: any) => {
    const source =
      this.state.viewState.comparatorBound === 'min' ? 'metricIntervalLowerBound' : 'metricIntervalUpperBound';
    const target = source === 'metricIntervalLowerBound' ? 'metricIntervalUpperBound' : 'metricIntervalLowerBound';
    if (command.step) {
      const steps = command.step.stepAdjustments;
      steps.forEach((step: { [x: string]: any }, index: number) => {
        if (steps.length > index + 1) {
          steps[index + 1][target] = step[source];
        }
      });
      delete steps[steps.length - 1][source];
    }
    this.setState({ command });
  };

  switchMode = () => {
    const {
      viewState: { comparatorBound },
      command,
    } = this.state;
    const cooldownOrWarmup = command.step ? command.step.estimatedInstanceWarmup : command.simple.cooldown;
    if (command.step) {
      const policy = {
        cooldown: cooldownOrWarmup,
      };
      delete command.step;
      command.simple = this.initializeSimplePolicy(policy);
    } else {
      const stepAdjustments: any[] = [{ adjustmentValue: command.simple.adjustmentValue }];
      if (comparatorBound === 'min') {
        stepAdjustments[0].metricIntervalUpperBound = 0;
      } else {
        stepAdjustments[0].metricIntervalLowerBound = 0;
      }
      delete command.simple;
      command.step = this.initializeStepPolicy(command.alarm, {
        estimatedInstanceWarmup: cooldownOrWarmup,
        stepAdjustments: stepAdjustments,
      });
      this.boundsChanged(command);
    }
    this.setState({ command });
  };

  private prepareCommandForSubmit = () => {
    const {
      command: { step, alarm, simple, adjustmentType },
      viewState: { operator, isNew },
    } = this.state;
    const {
      serverGroup: { account, region, name },
      application,
      policy: { autoScalingPolicyId },
    } = this.props;

    if (step) {
      step.stepAdjustments.forEach(
        (step: { adjustmentValue: number; metricIntervalLowerBound: number; metricIntervalUpperBound: number }) => {
          if (operator === 'Remove') {
            step.adjustmentValue = 0 - step.adjustmentValue;
          }
          if (step.metricIntervalLowerBound !== undefined) {
            step.metricIntervalLowerBound -= alarm.threshold;
          }
          if (step.metricIntervalUpperBound !== undefined) {
            step.metricIntervalUpperBound -= alarm.threshold;
          }
        },
      );
    } else {
      if (operator === 'Remove') {
        simple.adjustmentValue = 0 - simple.adjustmentValue;
      }
    }
    return {
      application: application.name,
      accountName: account,
      credentials: account,
      region,
      cloudProvider: 'tencentcloud',
      serverGroupName: name,
      operationType: isNew ? 'CREATE' : 'MODIFY',
      scalingPolicyId: autoScalingPolicyId,
      adjustmentType,
      adjustmentValue: step.stepAdjustments[0] && step.stepAdjustments[0].adjustmentValue,
      metricAlarm: alarm,
    };
  };

  private handleSubmit = () => {
    const { application } = this.props;
    const command = this.prepareCommandForSubmit();
    const submitMethod = () => ScalingPolicyWriter.upsertScalingPolicy(application, command);
    this.state.taskMonitor.submit(submitMethod);
  };

  public render() {
    const { serverGroup, dismissModal } = this.props;
    const { taskMonitor, viewState, command } = this.state;
    return (
      // @ts-ignore
      <WizardModal<>
        heading={`${viewState.isNew ? 'Create' : 'Edit'} scaling policy`}
        dismissModal={dismissModal}
        formClassName="form-inline scaling-policy-modal"
        taskMonitor={taskMonitor}
        submitButtonLabel="Submit"
        closeModal={this.handleSubmit}
        render={({ nextIdx, wizard }) => {
          return (
            <>
              <WizardPage
                label="Conditions"
                wizard={wizard}
                order={nextIdx()}
                render={() => (
                  <AlarmConfigurer
                    command={command}
                    serverGroup={serverGroup}
                    modalViewState={viewState}
                    boundsChanged={this.boundsChanged}
                  />
                )}
              />
              {command.alarm.metricName && command.simple && (
                <WizardPage
                  label="Actions"
                  wizard={wizard}
                  order={nextIdx()}
                  render={() => (
                    <SimplePolicyAction
                      command={command}
                      modalViewState={viewState}
                      boundsChanged={this.boundsChanged}
                      operatorChanged={(v: any) => {
                        this.setState({ viewState: v });
                      }}
                    />
                  )}
                />
              )}
              {command.alarm.metricName && command.step && (
                <WizardPage
                  label="Actions"
                  wizard={wizard}
                  order={nextIdx()}
                  render={() => (
                    <StepPolicyAction
                      command={command}
                      modalViewState={viewState}
                      boundsChanged={this.boundsChanged}
                      operatorChanged={(v: any) => {
                        this.setState({ viewState: v });
                      }}
                    />
                  )}
                />
              )}
              {!command.alarm.metricName && <h4 className="text-center">Select a metric</h4>}
            </>
          );
        }}
      />
    );
  }
}
