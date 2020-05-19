import { IPromise } from 'angular';

import { API } from '@spinnaker/core';

interface ITencentCloudLoadBalancer {
  accounts: string;
  id: string;
  name: string;
  region: string;
  type: string;
  vpcId: string;
}

export class LoadBalancerReader {
  public static findLoadBalancer(params: {
    account: string;
    region: string;
    loadBalancerId: string;
  }): IPromise<ITencentCloudLoadBalancer[]> {
    return API.one('loadBalancers')
      .withParams({ ...params, provider: 'tencentcloud' })
      .get()
      .catch(() => [] as ITencentCloudLoadBalancer[]);
  }

  public static getLoadBalancers(): IPromise<ITencentCloudLoadBalancer> {
    return API.one('loadBalancers')
      .withParams({ provider: 'tencentcloud' })
      .get()
      .then((results: any[]) => (results && results.length ? results[0] : null))
      .catch(() => [] as ITencentCloudLoadBalancer[]);
  }
}
