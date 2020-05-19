import * as React from 'react';
import { get } from 'lodash';
import {
  ReactModal,
  WizardModal,
  noop,
  TaskMonitor,
  ReactInjector,
  ReactSelectInput,
  TaskReason,
  PlatformHealthOverride,
} from '@spinnaker/core';
import './style.less';

interface IRollbackServerGroupModalProps {
  application?: any;
  allServerGroups: any;
  serverGroup?: any;
  previousServerGroup: any;
  closeModal?(result?: any): void;
  dismissModal?(rejection?: any): void;
}

interface IRollbackServerGroupModalState {
  taskMonitor: TaskMonitor;
  command: any;
  previousServerGroup: any;
}

export default class RollbackServerGroupModal extends React.Component<
  IRollbackServerGroupModalProps,
  IRollbackServerGroupModalState
> {
  public static defaultProps: Partial<IRollbackServerGroupModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };
  public static show(props: IRollbackServerGroupModalProps): Promise<void> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(RollbackServerGroupModal, props, modalProps);
  }

  constructor(props: IRollbackServerGroupModalProps) {
    super(props);
    const { serverGroup, application, allServerGroups, previousServerGroup } = this.props;
    const _allServerGroups = allServerGroups.sort((a: { name: any }, b: { name: string }) =>
      b.name.localeCompare(a.name),
    );
    const getState = () => {
      let rollbackType = 'EXPLICIT';
      const _previousServerGroup: any = {};
      if (_allServerGroups.length === 0 && serverGroup.entityTags) {
        const tmpPreviousServerGroup: any = get(serverGroup, 'entityTags.creationMetadata.value.previousServerGroup');
        if (tmpPreviousServerGroup) {
          rollbackType = 'PREVIOUS_IMAGE';
          _previousServerGroup.name = tmpPreviousServerGroup.name;
          _previousServerGroup.imageName = tmpPreviousServerGroup.imageName;
        }

        if (tmpPreviousServerGroup.imageId && tmpPreviousServerGroup.imageId !== tmpPreviousServerGroup.imageName) {
          _previousServerGroup.imageId = tmpPreviousServerGroup.imageId;
        }

        const buildNumber = get(tmpPreviousServerGroup, 'buildInfo.jenkins.number');
        if (buildNumber) {
          _previousServerGroup.buildNumber = buildNumber;
        }
      }
      let healthyPercent;
      const desired = serverGroup.capacity.desired;
      if (desired < 10) {
        healthyPercent = 100;
      } else if (desired < 20) {
        healthyPercent = 90;
      } else {
        healthyPercent = 95;
      }
      let interestingHealthProviderNames, platformHealthOnlyShowOverride;
      if (application && application.attributes) {
        if (application.attributes.platformHealthOnlyShowOverride && application.attributes.platformHealthOnly) {
          interestingHealthProviderNames = ['Tencentcloud'];
        }
        platformHealthOnlyShowOverride = application.attributes.platformHealthOnlyShowOverride;
      }

      return {
        previousServerGroup: _previousServerGroup,
        command: {
          rollbackType,
          rollbackContext: {
            rollbackServerGroupName: serverGroup.name,
            restoreServerGroupName: previousServerGroup ? previousServerGroup.name : undefined,
            targetHealthyRollbackPercentage: healthyPercent,
            delayBeforeDisableSeconds: 0,
            interestingHealthProviderNames,
            platformHealthOnlyShowOverride,
          },
        },
      };
    };
    this.state = {
      ...getState(),
      taskMonitor: new TaskMonitor({
        application: application,
        title: 'Rollback ' + this.props.serverGroup.name,
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
        onTaskComplete: () => application.serverGroups.refresh(),
        onTaskRetry: () => {
          this.setState({
            taskMonitor: null,
          });
        },
      }),
    };
  }

  private label = (serverGroup: { buildInfo: { jenkins: { number: string } }; name: string }) => {
    if (!serverGroup) {
      return '';
    }
    if (!serverGroup.buildInfo || !serverGroup.buildInfo.jenkins || !serverGroup.buildInfo.jenkins.number) {
      return serverGroup.name;
    }
    return serverGroup.name + ' (build #' + serverGroup.buildInfo.jenkins.number + ')';
  };

  private handleSubmit = () => {
    const command = {};
    const submitMethod = () => {
      const { application, serverGroup } = this.props;
      return ReactInjector.serverGroupWriter.rollbackServerGroup(serverGroup, application, command);
    };

    this.state.taskMonitor.submit(submitMethod);
  };
  private minHealthy = (percent: number) => {
    const desired = this.props.serverGroup.capacity.desired;
    return Math.ceil((desired * percent) / 100);
  };

  public render() {
    const { serverGroup, dismissModal } = this.props;
    const { taskMonitor, command, previousServerGroup } = this.state;
    return (
      // @ts-ignore
      <WizardModal<>
        heading={`Rollback ${serverGroup.name}`}
        formClassName="rollback-form"
        dismissModal={dismissModal}
        taskMonitor={taskMonitor}
        submitButtonLabel="Submit"
        closeModal={this.handleSubmit}
        render={() => {
          return (
            <div>
              <div className="row">
                <div className="col-sm-3 sm-label-right">Restore to</div>
                <div className="col-md-7">
                  <ReactSelectInput />
                  {command.rollbackType === 'PREVIOUS_IMAGE' && (
                    <div style={{ marginTop: 5 }}>
                      {previousServerGroup.name} <span className="small">(no longer deployed)</span>
                      <br />
                      <span className="small">
                        <strong>Image</strong>: {previousServerGroup.imageName}
                        {previousServerGroup.imageId || ''}
                        <br />
                      </span>
                      {previousServerGroup.buildNumber && (
                        <span className="small">
                          <strong>Build</strong> # {previousServerGroup.buildNumber}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {command.platformHealthOnlyShowOverride && (
                <PlatformHealthOverride
                  interestingHealthProviderNames={command.interestingHealthProviderNames}
                  platformHealthType="Tencentcloud"
                  onChange={() => {}}
                />
              )}
              <TaskReason reason="" onChange={() => {}} />
              <div className="row">
                <div className="col-sm-3 sm-label-right"></div>
                <div className="col-md-7">
                  Wait
                  <input
                    style={{ margin: '0 5px' }}
                    placeholder="0"
                    min="0"
                    type="number"
                    name="delayBeforeDisableSeconds"
                    value="command.rollbackContext.delayBeforeDisableSeconds"
                    className="form-control input-sm inline-number"
                  />
                  seconds before disabling <em>{this.label(serverGroup)}</em>.
                </div>
              </div>
              <div className="row">
                <div className="col-sm-3 sm-label-right"></div>
                <div className="col-md-7">
                  Consider rollback successful when
                  <input
                    style={{ margin: '0 5px' }}
                    placeholder="0"
                    min="0"
                    max="100"
                    type="number"
                    name="targetHealthyRollbackPercentage"
                    value="command.rollbackContext.targetHealthyRollbackPercentage"
                    className="form-control input-sm inline-number"
                  />
                  percent of instances are healthy.
                </div>
              </div>
              <div className="row">
                <div className="col-sm-3 sm-label-right">
                  <strong>Rollback Operations</strong>
                </div>
                <div className="col-md-7">
                  {command.rollbackType === 'EXPLICIT' && (
                    <>
                      <ol style={{ padding: '10px 0 0 0 ' }}>
                        <li>
                          Enable <em>{command.rollbackContext.restoreServerGroupName || 'previous server group'}</em>
                        </li>
                        <li>
                          Resize <em>{command.rollbackContext.restoreServerGroupName || 'previous server group'}</em> to
                          [<strong>min</strong>: {serverGroup.capacity.desired}, <strong>max</strong>:{' '}
                          {serverGroup.capacity.max}, <strong>desired</strong>: {serverGroup.capacity.desired} ] <br />
                          (minimum capacity pinned at
                          {serverGroup.capacity.desired} to prevent autoscaling down during rollback)
                        </li>

                        <li ng-if="command.rollbackContext.targetHealthyRollbackPercentage < 100">
                          Wait for at least {this.minHealthy(command.rollbackContext.targetHealthyRollbackPercentage)}{' '}
                          instances to report as healthy
                        </li>
                        <li ng-if="command.rollbackContext.delayBeforeDisableSeconds > 0">
                          Wait {command.rollbackContext.delayBeforeDisableSeconds} seconds
                        </li>
                        <li>
                          Disable <em>{serverGroup.name}</em>
                        </li>
                        <li>
                          Restore minimum capacity of
                          <em>{command.rollbackContext.restoreServerGroupName || 'previous server group'}</em> [
                          <strong>min</strong>: {serverGroup.capacity.min} ]
                        </li>
                      </ol>
                      <p>
                        This rollback will affect server groups in {serverGroup.account} ({serverGroup.region}).
                      </p>
                    </>
                  )}
                  {command.rollbackType === 'PREVIOUS_IMAGE' && (
                    <>
                      <ol>
                        <li>
                          Deploy <em>{previousServerGroup.imageId}</em> [ <strong>min</strong>:
                          {serverGroup.capacity.desired}, <strong>max</strong>: {serverGroup.capacity.max},
                          <strong>desired</strong>: {serverGroup.capacity.desired} ] <br />
                          (minimum capacity pinned at
                          {serverGroup.capacity.desired} to prevent autoscaling down during deploy)
                        </li>
                        <li ng-if="command.rollbackContext.targetHealthyRollbackPercentage < 100">
                          Wait for at least {this.minHealthy(command.rollbackContext.targetHealthyRollbackPercentage)}{' '}
                          instances to report as healthy
                        </li>
                        <li>Disable {serverGroup.name}</li>
                        <li>
                          Restore minimum capacity of <em>new server group</em> [ <strong>min</strong>:{' '}
                          {serverGroup.capacity.min} ]
                        </li>
                      </ol>
                      <p>
                        This rollback will affect server groups in {serverGroup.account} ({serverGroup.region}).
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        }}
      />
    );
  }
}
