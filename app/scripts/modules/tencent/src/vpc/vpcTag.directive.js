'use strict';

const angular = require('angular');

import { VpcReader } from '../vpc/VpcReader';

export const TENCENT_VPC_VPCTAG_DIRECTIVE = 'spinnaker.tencent.vpc.tag.directive';
export const name = TENCENT_VPC_VPCTAG_DIRECTIVE; // for backwards compatibility
angular.module(TENCENT_VPC_VPCTAG_DIRECTIVE, []).directive('tencentVpcTag', function() {
  return {
    restrict: 'E',
    scope: {
      vpcId: '=',
    },
    template: '<span class="vpc-tag">{{vpcLabel}}</span>',
    link: function(scope) {
      function applyLabel() {
        if (!scope.vpcId) {
          scope.vpcLabel = 'None ';
        } else {
          VpcReader.getVpcName(scope.vpcId).then(function(name) {
            scope.vpcLabel = '(' + scope.vpcId + ')';

            if (name) {
              scope.vpcLabel = name + ' ' + scope.vpcLabel;
            }
          });
        }
      }

      scope.$watch('vpcId', applyLabel, true);
    },
  };
});
