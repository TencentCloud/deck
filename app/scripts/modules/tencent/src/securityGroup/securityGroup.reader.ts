import { module } from 'angular';
import { ISecurityGroupsByAccount, ISecurityGroup } from '@spinnaker/core';

export class TencentCloudSecurityGroupReader {
  public resolveIndexedSecurityGroup(
    indexedSecurityGroups: ISecurityGroupsByAccount,
    container: ISecurityGroup,
    securityGroupId: string,
  ): ISecurityGroup {
    return indexedSecurityGroups[container.account][container.region][securityGroupId];
  }
}

export const TENCENTCLOUD_SECURITY_GROUP_READER = 'spinnaker.tencent.securityGroup.reader';
module(TENCENTCLOUD_SECURITY_GROUP_READER, []).service('tencentSecurityGroupReader', TencentCloudSecurityGroupReader);
