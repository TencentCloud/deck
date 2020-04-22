import * as React from 'react';
import { Dropdown } from 'react-bootstrap';

import {
  Application,
  ConfirmationModalService,
  FirewallLabels,
  SecurityGroupWriter,
  ISecurityGroupJob,
} from '@spinnaker/core';

import { ISecurityGroupDetail } from '../define';
import { EditSecurityGroupModal } from '../configure/EditSecurityGroup';

export interface IActionsProps {
  application: Application;
  securityGroup: ISecurityGroupDetail;
}

export interface IActionsState {}

export class Actions extends React.Component<IActionsProps, IActionsState> {
  constructor(props: IActionsProps) {
    super(props);
  }
  state = {};
  public componentWillMount(): void {}

  public handleEdit = (): void => {
    EditSecurityGroupModal.show(this.props);
  };

  public handleDelete = (): void => {
    const { application, securityGroup } = this.props;
    let isRetry = false;
    const retryParams = {
      removeDependencies: true,
    };
    const taskMonitor = {
      application,
      title: 'Deleting ' + securityGroup.name,
      onTaskRetry: () => {
        isRetry = true;
      },
    };

    const submitMethod = () => {
      const params = ({
        cloudProvider: securityGroup.provider,
        region: securityGroup.region,
        securityGroupId: securityGroup.id,
        accountName: securityGroup.accountId,
        credentials: securityGroup.credentials,
      } as unknown) as ISecurityGroupJob;
      if (isRetry) {
        Object.assign(params, retryParams);
      }
      return SecurityGroupWriter.deleteSecurityGroup(securityGroup, application, params);
    };

    ConfirmationModalService.confirm({
      header: 'Really delete ' + securityGroup.name + '?',
      buttonText: 'Delete ' + securityGroup.name,
      // provider: 'tencentcloud',
      account: securityGroup.accountId,
      // applicationName: app.name,
      taskMonitorConfig: taskMonitor,
      submitMethod: submitMethod,
      retryBody: `<div><p>Retry deleting the ${FirewallLabels.get(
        'firewall',
      )} and revoke any dependent ingress rules?</p><p>Any instance or load balancer associations will have to removed manually.</p></div>`,
    });
  };

  // private entityTagUpdate = (): void => {};

  public render() {
    return (
      <div style={{ display: 'inline-block' }}>
        <Dropdown className="dropdown" id="function-actions-dropdown">
          <Dropdown.Toggle className="btn btn-sm btn-primary dropdown-toggle">
            <span>{FirewallLabels.get('Firewall')} Actions</span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu">
            <li>
              <a className="clickable" onClick={this.handleEdit}>
                Edit {FirewallLabels.get('Firewall')}
              </a>
            </li>

            <li>
              <a className="clickable" onClick={this.handleDelete}>
                Delete {FirewallLabels.get('Firewall')}
              </a>
            </li>
            {/* {SETTINGS && SETTINGS.feature.entityTags && (
              <AddEntityTagLinks
                component={functionDef}
                application={app}
                entityType="function"
                onUpdate={this.entityTagUpdate}
              />
            )} */}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}
