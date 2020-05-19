import { module } from 'angular';

import { TencentCloudReactInjector } from './tencentCloud.react.injector';

export const TENCENTCLOUD_REACT_MODULE = 'spinnaker.tencentcloud.react';
module(TENCENTCLOUD_REACT_MODULE, []).run([
  '$injector',
  function($injector: any) {
    // Make angular services importable and (TODO when relevant) convert angular components to react
    TencentCloudReactInjector.initialize($injector);
  },
]);
