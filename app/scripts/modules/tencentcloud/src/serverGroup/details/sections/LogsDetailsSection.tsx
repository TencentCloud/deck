import * as React from 'react';

import { CollapsibleSection, NgReact } from '@spinnaker/core';

import { ITencentcloudServerGroupDetailsSectionProps } from './ITencentcloudServerGroupDetailsSectionProps';

export class LogsDetailsSection extends React.Component<ITencentcloudServerGroupDetailsSectionProps> {
  public render(): JSX.Element {
    const { ViewScalingActivitiesLink } = NgReact;
    return (
      <CollapsibleSection heading="Logs">
        <ul>
          <li>
            <ViewScalingActivitiesLink serverGroup={this.props.serverGroup} />
          </li>
        </ul>
      </CollapsibleSection>
    );
  }
}
