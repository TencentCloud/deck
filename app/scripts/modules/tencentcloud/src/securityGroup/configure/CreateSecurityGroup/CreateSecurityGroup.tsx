import * as React from 'react';
import {
  FirewallLabels,
  ReactModal,
  WizardModal,
  WizardPage,
  noop,
  Application,
  TaskMonitor,
  ReactInjector,
  SecurityGroupWriter,
} from '@spinnaker/core';
import { cloneDeep, get } from 'lodash';
import { LoadBalancerLocation } from '../../../loadBalancer/configure/common/LoadBalancerLocation';
import Ingress from './CreateSecurityGroupIngress';

export interface ICreateSecurityGroupProps {
  isNew: boolean;
  closeModal?(result?: any): void;
  dismissModal?(rejection?: any): void;
  application: Application;
}
export interface ISecurityGroupUpsertCommand {
  cloudProvider: string;
  // stack?: string;
  // detail?: string;
  // application: string;
  credentials: string;
  // accountName: string;
  name: string;
  securityGroupDesc: string;
  region: string;
  inRules: any[];
}
export interface ICreateSecurityGroupState {
  taskMonitor: TaskMonitor;
  // securityGroupCommand: ISecurityGroupUpsertCommand;
}

export class CreateSecurityGroupModal extends React.Component<ICreateSecurityGroupProps, ICreateSecurityGroupState> {
  public static defaultProps: Partial<ICreateSecurityGroupProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static show(props: ICreateSecurityGroupProps): Promise<ISecurityGroupUpsertCommand> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(CreateSecurityGroupModal, props, modalProps);
  }

  constructor(props: ICreateSecurityGroupProps) {
    super(props);
    this.state = {
      taskMonitor: null,
      // securityGroupCommand:{},
    };
  }

  private _isUnmounted = false;
  private refreshUnsubscribe: () => void;
  public componentWillUnmount(): void {
    this._isUnmounted = true;
    if (this.refreshUnsubscribe) {
      this.refreshUnsubscribe();
    }
  }
  protected onApplicationRefresh(values: ISecurityGroupUpsertCommand): void {
    if (this._isUnmounted) {
      return;
    }
    this.refreshUnsubscribe = undefined;
    this.props.dismissModal();
    this.setState({ taskMonitor: undefined });
    const newStateParams = {
      name: values.name,
      accountId: values.credentials,
      region: values.region,
      // vpcId: values.vpcId,
      provider: 'tencentcloud',
    };

    if (!ReactInjector.$state.includes('**.loadBalancerDetails')) {
      ReactInjector.$state.go('.loadBalancerDetails', newStateParams);
    } else {
      ReactInjector.$state.go('^.loadBalancerDetails', newStateParams);
    }
  }
  private onTaskComplete(values: ISecurityGroupUpsertCommand): void {
    this.props.application.loadBalancers.refresh();
    this.refreshUnsubscribe = this.props.application.loadBalancers.onNextRefresh(null, () =>
      this.onApplicationRefresh(values),
    );
  }
  private submit = (values: ISecurityGroupUpsertCommand): void => {
    const { application, isNew } = this.props;
    const commandFormatted = cloneDeep(values);
    const command = {
      cloudProvider: 'tencentcloud',
      name: values.name,
      // stack: values.stack,
      // detail: values.detail,
      // application: application.name,
      account: values.credentials,
      securityGroupDesc: values.securityGroupDesc || 'desc',
      region: values.region,
      inRules: values.inRules,
    };
    const taskMonitor = new TaskMonitor({
      application: application,
      title: `${isNew ? 'Creating' : 'Updating'} ${FirewallLabels.get('Firewall')}`,
      modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
      onTaskComplete: () => this.onTaskComplete(commandFormatted),
    });
    taskMonitor.submit(() => {
      return SecurityGroupWriter.upsertSecurityGroup(command, application, 'Create');
    });
  };

  public render() {
    const { application, isNew, dismissModal } = this.props;
    const { taskMonitor } = this.state;
    return (
      <WizardModal<ISecurityGroupUpsertCommand>
        heading={`${isNew ? 'Creating' : 'Updating'} ${FirewallLabels.get('Firewall')}`}
        initialValues={}
        taskMonitor={taskMonitor}
        dismissModal={dismissModal}
        submitButtonLabel={isNew ? 'Create' : 'Update'}
        closeModal={this.submit}
        render={({ formik, nextIdx, wizard }) => {
          return (
            <>
              <WizardPage
                label="Location"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => (
                  <LoadBalancerLocation
                    forPipelineConfig
                    app={application}
                    formik={formik}
                    isNew={isNew}
                    ref={innerRef}
                  />
                )}
              />
              <WizardPage
                label="Ingress"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => <Ingress formik={formik} app={application} ref={innerRef} />}
              />
            </>
          );
        }}
      />
    );
  }
}
