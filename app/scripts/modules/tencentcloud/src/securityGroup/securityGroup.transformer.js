'use strict';

const angular = require('angular');

import { VpcReader } from '../vpc/VpcReader';

export const TENCENTCLOUD_SECURITYGROUP_SECURITYGROUP_TRANSFORMER = 'spinnaker.cloud.securityGroup.transformer';
export const name = TENCENTCLOUD_SECURITYGROUP_SECURITYGROUP_TRANSFORMER; // for backwards compatibility
angular
  .module(TENCENTCLOUD_SECURITYGROUP_SECURITYGROUP_TRANSFORMER, [])
  .factory('tencentCloudSecurityGroupTransformer', function() {
    function normalizeSecurityGroup(securityGroup) {
      return VpcReader.listVpcs().then(addVpcNameToSecurityGroup(securityGroup));
    }

    function addVpcNameToSecurityGroup(securityGroup) {
      return function(vpcs) {
        const matches = vpcs.filter(function(test) {
          return test.id === securityGroup.vpcId;
        });
        securityGroup.vpcName = matches.length ? matches[0].name : '';
      };
    }

    return {
      normalizeSecurityGroup: normalizeSecurityGroup,
    };
  });
