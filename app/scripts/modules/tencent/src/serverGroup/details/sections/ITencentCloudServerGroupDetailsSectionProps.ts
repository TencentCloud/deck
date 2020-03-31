import { IServerGroupDetailsSectionProps } from '@spinnaker/core';

import { ITencentCloudServerGroupView } from 'tencent/domain';

export interface ITencentCloudServerGroupDetailsSectionProps extends IServerGroupDetailsSectionProps {
  serverGroup: ITencentCloudServerGroupView;
}
