import * as React from 'react';

import { CollapsibleSection, NgReact, Overridable, Application } from '@spinnaker/core';

import { ITencentcloudServerGroupDetailsSectionProps } from './ITencentcloudServerGroupDetailsSectionProps';
import { TencentcloudResizeServerGroupModal } from '../resize/TencentcloudResizeServerGroupModal';
import { ITencentcloudServerGroup } from 'tencentcloud/domain';

@Overridable('tencentcloud.serverGroup.CapacityDetailsSection')
export class CapacityDetailsSection extends React.Component<ITencentcloudServerGroupDetailsSectionProps> {
  public static resizeServerGroup(serverGroup: ITencentcloudServerGroup, application: Application): void {
    TencentcloudResizeServerGroupModal.show({ application, serverGroup });
  }

  public render(): JSX.Element {
    const { serverGroup, app } = this.props;
    const { ViewScalingActivitiesLink } = NgReact;
    const simple = serverGroup.asg.minSize === serverGroup.asg.maxSize;

    return (
      <CollapsibleSection heading="Capacity" defaultExpanded={true}>
        <dl className="dl-horizontal dl-flex">
          {simple && <dt>Min/Max</dt>}
          {simple && <dd>{serverGroup.asg.desiredCapacity}</dd>}

          {!simple && <dt>Min</dt>}
          {!simple && <dd>{serverGroup.asg.minSize}</dd>}
          {!simple && <dt>Desired</dt>}
          {!simple && <dd>{serverGroup.asg.desiredCapacity}</dd>}
          {!simple && <dt>Max</dt>}
          {!simple && <dd>{serverGroup.asg.maxSize}</dd>}

          <dt>Current</dt>
          <dd>{serverGroup.asg.instanceCount}</dd>
        </dl>

        <div>
          <a className="clickable" onClick={() => CapacityDetailsSection.resizeServerGroup(serverGroup, app)}>
            Resize Server Group
          </a>
        </div>

        <div>
          <ViewScalingActivitiesLink serverGroup={serverGroup} />
        </div>
      </CollapsibleSection>
    );
  }
}
