import * as React from 'react';
import { isEqual } from 'lodash';

import { ILoadBalancerClusterContainerProps } from '@spinnaker/core';

import { ITencentcloudApplicationLoadBalancer } from '../domain/ITencentcloudLoadBalancer';
import { TargetGroup } from './TargetGroup';

export class TencentcloudLoadBalancerClusterContainer extends React.Component<ILoadBalancerClusterContainerProps> {
  public shouldComponentUpdate(nextProps: ILoadBalancerClusterContainerProps) {
    const serverGroupsDiffer = () =>
      !isEqual(
        (nextProps.serverGroups || []).map((g: { name: any }) => g.name),
        (this.props.serverGroups || []).map((g: { name: any }) => g.name),
      );
    const targetGroupsDiffer = () =>
      !isEqual(
        ((nextProps.loadBalancer as ITencentcloudApplicationLoadBalancer).targetGroups || []).map(t => t.name),
        ((this.props.loadBalancer as ITencentcloudApplicationLoadBalancer).targetGroups || []).map(t => t.name),
      );
    return (
      nextProps.showInstances !== this.props.showInstances ||
      nextProps.showServerGroups !== this.props.showServerGroups ||
      nextProps.loadBalancer !== this.props.loadBalancer ||
      serverGroupsDiffer() ||
      targetGroupsDiffer()
    );
  }

  public render(): React.ReactElement<TencentcloudLoadBalancerClusterContainer> {
    const { loadBalancer, showInstances, showServerGroups } = this.props;
    const alb = loadBalancer as ITencentcloudApplicationLoadBalancer;
    const ServerGroups = alb.serverGroups
      ? alb.serverGroups.map(item => {
          return (
            <TargetGroup
              key={item.name}
              loadBalancer={loadBalancer as ITencentcloudApplicationLoadBalancer}
              targetGroup={item}
              showInstances={showInstances}
              showServerGroups={showServerGroups}
            />
          );
        })
      : [];
    return <div className="cluster-container">{ServerGroups}</div>;
  }
}
