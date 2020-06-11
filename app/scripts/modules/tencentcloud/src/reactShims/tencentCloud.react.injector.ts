import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { TencentcloudServerGroupConfigurationService } from '../serverGroup/configure/serverGroupConfiguration.service';
import { TencentcloudServerGroupTransformer } from '../serverGroup/serverGroup.transformer';
import { TencentcloudLoadBalancerTransformer } from '../loadBalancer/loadBalancer.transformer';

// prettier-ignore
export class TencentcloudReactInject extends ReactInject {
         public get tencentcloudInstanceTypeService() {
           return this.$injector.get('tencentcloudInstanceTypeService') as any;
         }
         public get tencentcloudLoadBalancerTransformer() {
           return this.$injector.get('tencentcloudLoadBalancerTransformer') as TencentcloudLoadBalancerTransformer;
         }
         public get tencentcloudServerGroupCommandBuilder() {
           return this.$injector.get('tencentcloudServerGroupCommandBuilder') as any;
         }
         public get tencentcloudServerGroupConfigurationService() {
           return this.$injector.get(
             'tencentcloudServerGroupConfigurationService',
           ) as TencentcloudServerGroupConfigurationService;
         }
         public get tencentcloudServerGroupTransformer() {
           return this.$injector.get('tencentcloudServerGroupTransformer') as TencentcloudServerGroupTransformer;
         }

         public initialize($injector: IInjectorService) {
           this.$injector = $injector;
         }
       }

export const TencentcloudReactInjector: TencentcloudReactInject = new TencentcloudReactInject();
