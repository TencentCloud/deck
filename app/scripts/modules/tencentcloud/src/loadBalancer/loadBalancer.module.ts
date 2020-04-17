import { module } from 'angular';

import { TENCENTCLOUD_LOAD_BALANCER_DETAILS_CTRL } from './details/loadBalancerDetails.controller';
import { TENCENTCLOUD_LOAD_BALANCER_TRANSFORMER } from './loadBalancer.transformer';
import { TENCENTCLOUD_TARGET_GROUP_DETAILS_CTRL } from './details/targetGroupDetails.controller';
import { LOAD_BALANCER_ACTIONS } from './details/loadBalancerActions.component';
import { TARGET_GROUP_STATES } from './targetGroup.states';

export const TENCENTCLOUD_LOAD_BALANCER_MODULE = 'spinnaker.tencentcloud.loadBalancer';

module(TENCENTCLOUD_LOAD_BALANCER_MODULE, [
  TENCENTCLOUD_LOAD_BALANCER_DETAILS_CTRL,
  TENCENTCLOUD_LOAD_BALANCER_TRANSFORMER,
  TENCENTCLOUD_TARGET_GROUP_DETAILS_CTRL,
  LOAD_BALANCER_ACTIONS,
  TARGET_GROUP_STATES,
]);
