import { module } from 'angular';

import { DETAILS_SUMMARY } from './detailsSummary.component';
import { TARGET_TRACKING_MODULE } from './targetTracking/targetTracking.module';
import { TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT } from './alarmBasedSummary.component';

export const SCALING_POLICY_MODULE = 'spinnaker.tencent.scalingPolicy.module';
module(SCALING_POLICY_MODULE, [
  DETAILS_SUMMARY,
  TARGET_TRACKING_MODULE,
  TENCENT_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT,
]);
