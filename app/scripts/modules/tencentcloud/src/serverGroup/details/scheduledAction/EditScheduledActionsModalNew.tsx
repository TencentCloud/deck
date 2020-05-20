import * as React from 'react';
import { IScheduledAction } from 'tencentcloud/domain';
import { ReactModal, WizardModal, noop, TaskMonitor, TaskExecutor } from '@spinnaker/core';
import { Table, Button } from 'react-bootstrap';
import './style.less';

interface IEditScheduledActionsModalProps {
  app?: any;
  serverGroup?: any;
  closeModal?(result?: any): void;
  dismissModal?(rejection?: any): void;
}

interface IEditScheduledActionsModalState {
  taskMonitor: TaskMonitor;
  scheduledActions: any;
}

export default class EditScheduledActionsModal extends React.Component<
  IEditScheduledActionsModalProps,
  IEditScheduledActionsModalState
> {
  public static defaultProps: Partial<IEditScheduledActionsModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };
  public static show(props: IEditScheduledActionsModalProps): Promise<void> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(EditScheduledActionsModal, props, modalProps);
  }

  constructor(props: IEditScheduledActionsModalProps) {
    super(props);
    const { serverGroup, app } = this.props;
    const scheduledActions = serverGroup.scheduledActions.map((action: IScheduledAction) => {
      return {
        recurrence: action.recurrence,
        minSize: action.minSize,
        maxSize: action.maxSize,
        desiredCapacity: action.desiredCapacity,
      };
    });
    this.state = {
      scheduledActions,
      taskMonitor: new TaskMonitor({
        application: app,
        title: 'Update Scheduled Actions for ' + this.props.serverGroup.name,
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
        onTaskComplete: () => app.serverGroups.refresh(),
        onTaskRetry: () => {
          this.setState({
            taskMonitor: null,
          });
        },
      }),
    };
  }

  private handleAdd = () => {
    const { scheduledActions } = this.state;
    scheduledActions.push({});
    this.setState({
      scheduledActions,
    });
  };

  private handleRemove = (index: number) => {
    const { scheduledActions } = this.state;
    scheduledActions.splice(index, 1);
    this.setState({
      scheduledActions,
    });
  };

  public handleChange = (value: any, label: any, index: number) => {
    const { scheduledActions } = this.state;
    scheduledActions[index][label] = value;
    this.setState({ scheduledActions });
  };

  private handleSubmit = () => {
    const {
      app,
      serverGroup: { account, name, region },
    } = this.props;
    const job = [
      {
        type: 'upsertTencentcloudScheduledActions',
        asgs: [{ asgName: name, region }],
        scheduledActions: this.state.scheduledActions,
        credentials: account,
      },
    ];
    const submitMethod = () => {
      return TaskExecutor.executeTask({
        job,
        application: app,
        description: 'Update Scheduled Actions for ' + name,
      });
    };

    this.state.taskMonitor.submit(submitMethod);
  };

  public render() {
    const { serverGroup, dismissModal } = this.props;
    const { taskMonitor, scheduledActions } = this.state;
    return (
      // @ts-ignore
      <WizardModal<>
        heading={`Edit Scheduled Actions for ${serverGroup.name}`}
        formClassName="edit-scheduled-form"
        dismissModal={dismissModal}
        taskMonitor={taskMonitor}
        submitButtonLabel="Submit"
        closeModal={this.handleSubmit}
        render={() => {
          return (
            <div>
              <p>You must specify : Min Size, Max Size, Desired Capacity and StartTime</p>
              <p>Recurrence (CRON) and EndTime are required when Repeat is 'Yes'</p>
              <p>
                <strong>Note:</strong> CRON expressions are evaluated in UTC.
              </p>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Recurrence (CRON)</th>
                    <th>Min Size</th>
                    <th>Max Size</th>
                    <th>Desired Capacity</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledActions.map((action: any, index: number) => (
                    <tr key={index}>
                      <td>
                        <input
                          required
                          className="form-control input-sm no-spel"
                          value={action.recurrence}
                          name={`recurrence-${index}`}
                          onChange={e => this.handleChange(e.target.value, 'recurrence', index)}
                        />
                      </td>
                      <td>
                        <input
                          required
                          type="number"
                          className="form-control input-sm"
                          style={{ minWidth: 60 }}
                          min={0}
                          max={action.maxSize || Infinity}
                          value={action.minSize}
                          onChange={e => this.handleChange(e.target.value, 'minSize', index)}
                        />
                      </td>
                      <td>
                        <input
                          required
                          type="number"
                          className="form-control input-sm"
                          style={{ minWidth: 60 }}
                          min={action.minSize || 0}
                          value={action.maxSize}
                          onChange={e => this.handleChange(e.target.value, 'maxSize', index)}
                        />
                      </td>
                      <td>
                        <input
                          required
                          type="number"
                          className="form-control input-sm"
                          min={action.minSize || 0}
                          max={action.maxSize || Infinity}
                          value={action.desiredCapacity}
                          onChange={e => this.handleChange(e.target.value, 'desiredCapacity', index)}
                        />
                      </td>
                      <td>
                        <a className="sm-label" onClick={() => this.handleRemove(index)}>
                          <span className="glyphicon glyphicon-trash"></span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={7}>
                      <Button block className="btn-block add-new" onClick={() => this.handleAdd()}>
                        <span className="glyphicon glyphicon-plus-sign" />
                        Add new Scheduled Action
                      </Button>
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          );
        }}
      />
    );
  }
}
