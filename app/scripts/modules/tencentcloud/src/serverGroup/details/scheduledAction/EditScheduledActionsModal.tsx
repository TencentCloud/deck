import * as React from 'react';
import { IScheduledAction } from 'tencentcloud/domain';
import { format } from 'date-fns';
import { ReactModal, WizardModal, noop, TaskMonitor, TaskExecutor, SelectInput } from '@spinnaker/core';
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
  scheduledActions: any[];
}

const getBeijingTime = (date: string | number | Date) => {
  const timezone = 8;
  const offsetGmt = new Date().getTimezoneOffset();
  const nowDate = new Date(date).getTime();
  return format(new Date(nowDate + offsetGmt * 60 * 1000 + timezone * 60 * 60 * 1000), 'YYYY-MM-DDTHH:mm:ss+08:00');
};

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
        scheduledActionId: action.scheduledActionId,
        startTime: new Date(action.startTime),
        endTime: action.endTime == '0000-00-00T00:00:00+08:00' ? undefined : new Date(action.endTime),
        repeat: action.recurrence && action.endTime != '0000-00-00T00:00:00+08:00' ? 'Yes' : 'No',
        recurrence: action.recurrence,
        minSize: action.minSize,
        maxSize: action.maxSize,
        desiredCapacity: action.desiredCapacity,
        operationType: 'MODIFY',
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
    scheduledActions.push({
      repeat: 'No',
      operationType: 'CREATE',
    });
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

  public handleChange = (value: any, label: string, index: number) => {
    const { scheduledActions } = this.state;
    scheduledActions[index][label] = value;
    if (label === 'repeat' && value === 'No') {
      scheduledActions[index].recurrence = '';
      scheduledActions[index].endTime = '';
    }
    this.setState({ scheduledActions });
  };

  private handleSubmit = () => {
    const {
      app,
      serverGroup: { account, name, region },
    } = this.props;
    const job = this.state.scheduledActions.map(
      ({
        scheduledActionId,
        operationType,
        minSize,
        maxSize,
        desiredCapacity,
        startTime,
        repeat,
        recurrence,
        endTime,
      }) => ({
        type: 'upsertTencentcloudScheduledActions',
        application: app.name,
        account,
        accountName: account,
        credentials: account,
        cloudProvider: 'tencentcloud',
        region,
        serverGroupName: name,
        scheduledActionId,
        operationType,
        minSize,
        maxSize,
        desiredCapacity,
        startTime: getBeijingTime(startTime),
        endTime: repeat == 'Yes' && recurrence ? getBeijingTime(endTime) : '0000-00-00T00:00:00+08:00',
        recurrence: repeat == 'Yes' ? recurrence : '* * * * *',
      }),
    );
    const submitMethod = () => {
      const { app, serverGroup } = this.props;
      return TaskExecutor.executeTask({
        job: job,
        application: app,
        description: 'Update Scheduled Actions for ' + serverGroup.name,
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
                    <th>Start Time</th>
                    <th>Repeat</th>
                    <th>Recurrence (CRON)</th>
                    <th>End Time</th>
                    <th>Min Size</th>
                    <th>Max Size</th>
                    <th>Desired Capacity</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledActions.map((action, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="datetime-local"
                          required
                          className={`form-control input-sm no-spel`}
                          name={`startTime-${index}`}
                          value={action.startTime}
                          onChange={e => this.handleChange(e.target.value, 'startTime', index)}
                        />
                      </td>
                      <td>
                        <SelectInput
                          required
                          inputClassName="form-control input-sm"
                          options={['Yes', 'No']}
                          value={action.repeat}
                          onChange={e => this.handleChange(e.target.value, 'repeat', index)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control input-sm no-spel"
                          value={action.recurrence}
                          name={`recurrence-${index}`}
                          required={action.repeat === 'Yes'}
                          disabled={action.repeat === 'No'}
                          onChange={e => this.handleChange(e.target.value, 'recurrence', index)}
                        />
                      </td>
                      <td>
                        <input
                          type="datetime-local"
                          className="form-control input-sm no-spel"
                          value={action.endTime}
                          name={`endTime-${index}`}
                          required={action.repeat === 'Yes'}
                          disabled={action.repeat === 'No'}
                          onChange={e => this.handleChange(e.target.value, 'endTime', index)}
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
