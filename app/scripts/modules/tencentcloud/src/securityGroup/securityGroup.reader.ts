import { module } from 'angular';
import { ISecurityGroupsByAccount, ISecurityGroup } from '@spinnaker/core';

export class TencentcloudSecurityGroupReader {
  public resolveIndexedSecurityGroup(
    indexedSecurityGroups: ISecurityGroupsByAccount,
    container: ISecurityGroup,
    securityGroupId: string,
  ): ISecurityGroup {
    return indexedSecurityGroups[container.account][container.region][securityGroupId];
  }
}

export const TENCENTCLOUD_SECURITY_GROUP_READER = 'spinnaker.tencentcloud.securityGroup.reader';
module(TENCENTCLOUD_SECURITY_GROUP_READER, []).service(
  'tencentcloudSecurityGroupReader',
  TencentcloudSecurityGroupReader,
);
