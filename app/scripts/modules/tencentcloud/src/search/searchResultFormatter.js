'use strict';

const angular = require('angular');

import { VpcReader } from '../vpc/VpcReader';

export const TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER = 'spinnaker.tencentcloud.search.searchResultFormatter';
angular.module(TENCENTCLOUD_SEARCH_SEARCHRESULTFORMATTER, []).factory('tencentcloudSearchResultFormatter', function() {
  return {
    securityGroups: function(entry) {
      return VpcReader.getVpcName(entry.vpcId).then(function(vpcName) {
        const region = vpcName ? entry.region + ' - ' + vpcName.toLowerCase() : entry.region;
        return entry.name + ' (' + region + ')';
      });
    },
  };
});
