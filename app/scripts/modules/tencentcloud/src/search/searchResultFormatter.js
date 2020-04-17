'use strict';

const angular = require('angular');

import { VpcReader } from '../vpc/VpcReader';

export const TENCENT_SEARCH_SEARCHRESULTFORMATTER = 'spinnaker.tencentcloud.search.searchResultFormatter';
angular.module(TENCENT_SEARCH_SEARCHRESULTFORMATTER, []).factory('tencentSearchResultFormatter', function() {
  return {
    securityGroups: function(entry) {
      return VpcReader.getVpcName(entry.vpcId).then(function(vpcName) {
        const region = vpcName ? entry.region + ' - ' + vpcName.toLowerCase() : entry.region;
        return entry.name + ' (' + region + ')';
      });
    },
  };
});
