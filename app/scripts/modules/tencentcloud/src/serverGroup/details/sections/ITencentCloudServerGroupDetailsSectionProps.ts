import { IServerGroupDetailsSectionProps } from '@spinnaker/core';

import { ITencentCloudServerGroupView } from 'tencentcloud/domain';

export interface ITencentCloudServerGroupDetailsSectionProps extends IServerGroupDetailsSectionProps {
  serverGroup: ITencentCloudServerGroupView;
}
