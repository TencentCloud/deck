import { Application, IServerGroup } from '@spinnaker/core';

import { IScalingPolicy } from 'tencentcloud/domain';

export interface IScalingPolicySummaryProps {
  policy: IScalingPolicy;
  serverGroup: IServerGroup;
  application: Application;
}
