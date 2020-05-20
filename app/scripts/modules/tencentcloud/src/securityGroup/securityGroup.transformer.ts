import { module } from 'angular';
import { VpcReader } from '../vpc/VpcReader';
import { IVpc, ISecurityGroup } from '@spinnaker/core';

export class TencentcloudSecurityGroupTransformer {
  addVpcNameToSecurityGroup(securityGroup: ISecurityGroup) {
    return (vpcs: IVpc[]) => {
      const matches = vpcs.filter(test => {
        return test.id === securityGroup.vpcId;
      });
      securityGroup.vpcName = matches.length ? matches[0].name : '';
    };
  }
  normalizeSecurityGroup(securityGroup: ISecurityGroup) {
    return VpcReader.listVpcs().then(this.addVpcNameToSecurityGroup(securityGroup));
  }
}

export const TENCENTCLOUD_SECURITYGROUP_TRANSFORMER = 'spinnaker.tencentcloud.securityGroup.transformer';
module(TENCENTCLOUD_SECURITYGROUP_TRANSFORMER, []).factory(
  'tencentcloudSecurityGroupTransformer',
  TencentcloudSecurityGroupTransformer,
);
