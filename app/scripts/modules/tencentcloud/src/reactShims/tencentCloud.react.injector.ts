import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { TencentCloudServerGroupConfigurationService } from '../serverGroup/configure/serverGroupConfiguration.service';
import { TencentCloudServerGroupTransformer } from '../serverGroup/serverGroup.transformer';
import { TencentCloudLoadBalancerTransformer } from '../loadBalancer/loadBalancer.transformer';

// prettier-ignore
export class TencentCloudReactInject extends ReactInject {
         public get tencentCloudCloudInstanceTypeService() {
           return this.$injector.get('tencentCloudInstanceTypeService') as any;
         }
         public get tencentCloudLoadBalancerTransformer() {
           return this.$injector.get('tencentCloudLoadBalancerTransformer') as TencentCloudLoadBalancerTransformer;
         }
         public get tencentCloudServerGroupCommandBuilder() {
           return this.$injector.get('tencentCloudServerGroupCommandBuilder') as any;
         }
         public get tencentCloudServerGroupConfigurationService() {
           return this.$injector.get(
             'tencentCloudServerGroupConfigurationService',
           ) as TencentCloudServerGroupConfigurationService;
         }
         public get tencentCloudServerGroupTransformer() {
           return this.$injector.get('tencentCloudServerGroupTransformer') as TencentCloudServerGroupTransformer;
         }

         public initialize($injector: IInjectorService) {
           this.$injector = $injector;
         }
       }

export const TencentCloudReactInjector: TencentCloudReactInject = new TencentCloudReactInject();
