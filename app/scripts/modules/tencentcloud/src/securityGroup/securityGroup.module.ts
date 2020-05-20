import { module } from 'angular';

import { TENCENTCLOUD_SECURITY_GROUP_READER } from './securityGroup.reader';
import { TENCENTCLOUD_SECURITYGROUP_TRANSFORMER } from './securityGroup.transformer';

export const TENCENTCLOUD_SECURITY_GROUP_MODULE = 'spinnaker.tencentcloud.securityGroup';
module(TENCENTCLOUD_SECURITY_GROUP_MODULE, [
  TENCENTCLOUD_SECURITY_GROUP_READER,
  TENCENTCLOUD_SECURITYGROUP_TRANSFORMER,
]);
