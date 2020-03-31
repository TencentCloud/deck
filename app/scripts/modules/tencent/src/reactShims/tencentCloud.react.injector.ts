import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { TencentCloudServerGroupConfigurationService } from '../serverGroup/configure/serverGroupConfiguration.service';
import { TencentCloudServerGroupTransformer } from '../serverGroup/serverGroup.transformer';
import { TencentCloudLoadBalancerTransformer } from '../loadBalancer/loadBalancer.transformer';

// prettier-ignore
export class TencentCloudReactInject extends ReactInject {
  public get tencentInstanceTypeService() { return this.$injector.get('tencentInstanceTypeService') as any; }
  public get tencentLoadBalancerTransformer() { return this.$injector.get('tencentLoadBalancerTransformer') as TencentCloudLoadBalancerTransformer; }
  public get tencentServerGroupCommandBuilder() { return this.$injector.get('tencentServerGroupCommandBuilder') as any; }
  public get tencentServerGroupConfigurationService() { return this.$injector.get('tencentServerGroupConfigurationService') as TencentCloudServerGroupConfigurationService; }
  public get tencentServerGroupTransformer() { return this.$injector.get('tencentServerGroupTransformer') as TencentCloudServerGroupTransformer; }

  public initialize($injector: IInjectorService) {
    this.$injector = $injector;
  }
}

export const TencentCloudReactInjector: TencentCloudReactInject = new TencentCloudReactInject();
