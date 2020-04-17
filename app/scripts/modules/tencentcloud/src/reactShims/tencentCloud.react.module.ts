import { module } from 'angular';

import { TencentCloudNgReact } from './tencentCloud.ngReact';
import { TencentCloudReactInjector } from './tencentCloud.react.injector';

export const TENCENT_REACT_MODULE = 'spinnaker.tencentcloud.react';
module(TENCENT_REACT_MODULE, []).run([
  '$injector',
  function($injector: any) {
    // Make angular services importable and (TODO when relevant) convert angular components to react
    TencentCloudReactInjector.initialize($injector);
    TencentCloudNgReact.initialize($injector);
  },
]);
