import * as React from 'react';
import { IScalingProcess } from 'tencentcloud/domain';
import { CollapsibleSection, HelpField, timestamp, Tooltip } from '@spinnaker/core';
import { AutoScalingProcessService } from '../scalingProcesses/AutoScalingProcessService';
import { ITencentcloudServerGroupDetailsSectionProps } from './ITencentcloudServerGroupDetailsSectionProps';

export interface IScalingProcessesDetailsSectionState {
  autoScalingProcesses: IScalingProcess[];
  scalingPoliciesDisabled: boolean;
  scheduledActionsDisabled: boolean;
}

export class ScalingProcessesDetailsSection extends React.Component<
  ITencentcloudServerGroupDetailsSectionProps,
  IScalingProcessesDetailsSectionState
> {
  constructor(props: ITencentcloudServerGroupDetailsSectionProps) {
    super(props);

    this.state = this.getState(props);
  }

  // private toggleScalingProcesses = (): void => {};

  private getState(props: ITencentcloudServerGroupDetailsSectionProps): IScalingProcessesDetailsSectionState {
    const { serverGroup } = props;

    const autoScalingProcesses: IScalingProcess[] = AutoScalingProcessService.normalizeScalingProcesses(serverGroup);

    const scalingPoliciesDisabled =
      serverGroup.scalingPolicies.length > 0 &&
      autoScalingProcesses
        .filter(p => !p.enabled)
        .some(p => ['Launch', 'Terminate', 'AlarmNotification'].includes(p.name));
    const scheduledActionsDisabled =
      serverGroup.scheduledActions.length > 0 &&
      autoScalingProcesses
        .filter(p => !p.enabled)
        .some(p => ['Launch', 'Terminate', 'ScheduledAction'].includes(p.name));

    return { autoScalingProcesses, scalingPoliciesDisabled, scheduledActionsDisabled };
  }

  public componentWillReceiveProps(nextProps: ITencentcloudServerGroupDetailsSectionProps): void {
    this.setState(this.getState(nextProps));
  }

  public render(): JSX.Element {
    const { autoScalingProcesses, scalingPoliciesDisabled, scheduledActionsDisabled } = this.state;

    return (
      <CollapsibleSection
        cacheKey="Scaling Processes"
        heading={({ chevron }) => (
          <h4 className="collapsible-heading">
            {chevron}
            <span>
              {scalingPoliciesDisabled && (
                <Tooltip value="Some scaling processes are disabled that may prevent scaling policies from working">
                  <span className="fa fa-exclamation-circle warning-text" />
                </Tooltip>
              )}
              {scheduledActionsDisabled && (
                <Tooltip value="Some scaling processes are disabled that may prevent scheduled actions from working">
                  <span className="fa fa-exclamation-circle warning-text" />
                </Tooltip>
              )}
              Scaling Processes
            </span>
          </h4>
        )}
      >
        <ul className="scaling-processes">
          {autoScalingProcesses.map(process => (
            <li key={process.name}>
              <span style={{ visibility: process.enabled ? 'visible' : 'hidden' }} className="fa fa-check small" />
              <span className={!process.enabled ? 'text-disabled' : ''}>{process.name} </span>
              <HelpField content={process.description} placement="bottom" />
              {process.suspensionDate && (
                <div className="text-disabled small" style={{ marginLeft: '35px' }}>
                  Suspended {timestamp(process.suspensionDate)}
                </div>
              )}
            </li>
          ))}
        </ul>
        {/* <a className="clickable" onClick={this.toggleScalingProcesses}>
          Edit Scaling Processes
        </a> */}
      </CollapsibleSection>
    );
  }
}
