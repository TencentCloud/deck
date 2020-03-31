'use strict';

const angular = require('angular');

import { VpcReader } from '../vpc/VpcReader';

export const TENCENT_SECURITYGROUP_SECURITYGROUP_TRANSFORMER = 'spinnaker.tencent.securityGroup.transformer';
export const name = TENCENT_SECURITYGROUP_SECURITYGROUP_TRANSFORMER; // for backwards compatibility
angular
  .module(TENCENT_SECURITYGROUP_SECURITYGROUP_TRANSFORMER, [])
  .factory('tencentSecurityGroupTransformer', function() {
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
