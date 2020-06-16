import { IServerGroupDetailsSectionProps } from '@spinnaker/core';

import { ITencentcloudServerGroupView } from 'tencentcloud/domain';

export interface ITencentcloudServerGroupDetailsSectionProps extends IServerGroupDetailsSectionProps {
  serverGroup: ITencentcloudServerGroupView;
}
