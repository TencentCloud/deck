import * as React from 'react';
import { IScope, IPromise } from 'angular';
import { Spinner } from '@spinnaker/core';
import { ITencentCloudLoadBalancerSourceData, ITencentCloudLoadBalancer } from '../../domain';

import { get } from 'lodash';
import { StateService } from '@uirouter/angularjs';

import {
  CollapsibleSection,
  ISecurityGroup,
  Application,
  IApplicationSecurityGroup,
  ILoadBalancer,
  AccountTag,
  LoadBalancerReader,
  ISubnet,
  SecurityGroupReader,
  SubnetReader,
  FirewallLabels,
} from '@spinnaker/core';

import { LoadBalancerActions } from './LoadBalancerActions';
import { VpcTag } from '../../vpc/VpcTag';

const LoadingSpinner = () => (
  <div className="horizontal middle center" style={{ marginBottom: '250px', height: '150px' }}>
    <Spinner size="medium" />
  </div>
);

interface ILoadBalancerDetailsProps {
  app: Application;
  loadBalancer: ITencentCloudLoadBalancer;
  $scope: IScope;
  $state: StateService;
}

export interface ILoadBalancerFromStateParams extends ITencentCloudLoadBalancer {
  accountId?: string;
  region?: string;
  name?: string;
}

interface ILoadBalancerDetailsState {
  firewallsLabel: string;
  securityGroups: ISecurityGroup[];
  loadBalancer: ITencentCloudLoadBalancer;
  loading: boolean;
}

export default class LoadBalancerDetails extends React.Component<ILoadBalancerDetailsProps, ILoadBalancerDetailsState> {
  private loadBalancerReader: LoadBalancerReader;
  private loadBalancerFromParams: ILoadBalancerFromStateParams;
  private securityGroupReader: SecurityGroupReader;
  private app: Application;
  constructor(props: ILoadBalancerDetailsProps) {
    super(props);
    this.loadBalancerReader = new LoadBalancerReader(null, null);
    this.loadBalancerFromParams = props.loadBalancer;
    this.securityGroupReader = new SecurityGroupReader(null, null, null, null);
    this.app = props.app;
    this.state = {
      firewallsLabel: FirewallLabels.get('Firewalls'),
      loadBalancer: props.loadBalancer,
      securityGroups: [],
      loading: false,
    };
  }

  public autoClose(): void {
    if (this.props.$scope.$$destroyed) {
      return;
    }
    this.props.$state.params.allowModalToStayOpen = true;
    this.props.$state.go('^', null, { location: 'replace' });
  }

  componentDidMount() {
    this.app
      .ready()
      .then(() => this.extractLoadBalancer())
      .then(() => {
        if (!this.props.$scope.$$destroyed) {
          this.app.getDataSource('loadBalancers').onRefresh(this.props.$scope, () => this.extractLoadBalancer());
        }
      });
  }

  extractLoadBalancer(): Promise<void> | IPromise<void> {
    const { app } = this.props;

    const appLoadBalancer = app.loadBalancers.data.find((test: ILoadBalancer) => {
      return (
        test.name === this.loadBalancerFromParams.name &&
        test.region === this.loadBalancerFromParams.region &&
        test.account === this.loadBalancerFromParams.accountId
      );
    });

    if (appLoadBalancer) {
      const detailsLoader = this.loadBalancerReader.getLoadBalancerDetails(
        'tencentcloud',
        this.loadBalancerFromParams.accountId,
        this.loadBalancerFromParams.region,
        appLoadBalancer.id,
      );
      return detailsLoader.then(
        (details: ITencentCloudLoadBalancerSourceData[]) => {
          const tempLoadBalancer = appLoadBalancer;
          this.setState({
            loading: false,
          });
          const securityGroups: IApplicationSecurityGroup[] = [];
          if (details.length) {
            tempLoadBalancer.elb = details[0];
            // this.ipAddressTypeDescription = 'IPv4';
            (tempLoadBalancer.elb.securityGroups || []).forEach((securityGroupId: string) => {
              const match = this.securityGroupReader.getApplicationSecurityGroup(
                this.app,
                this.loadBalancerFromParams.accountId,
                this.loadBalancerFromParams.region,
                securityGroupId,
              );
              if (match) {
                securityGroups.push(match);
              }
            });
            this.setState({
              securityGroups: securityGroups,
            });
            if (tempLoadBalancer.subnetId) {
              tempLoadBalancer.subnetDetails = [tempLoadBalancer.subnetId].reduce(
                (subnetDetails: ISubnet[], subnetId: string) => {
                  SubnetReader.getSubnetByIdAndProvider(subnetId, tempLoadBalancer.provider).then(
                    (subnetDetail: ISubnet) => {
                      subnetDetails.push(subnetDetail);
                    },
                  );
                  return subnetDetails;
                },
                [],
              );
            }
          }
          this.setState({
            loadBalancer: tempLoadBalancer,
          });
        },
        () => this.autoClose(),
      );
    } else {
      this.autoClose();
    }
    if (!this.state.loadBalancer) {
      this.autoClose();
    }
    return Promise.resolve();
  }

  render() {
    const { app } = this.props;
    const { firewallsLabel, loading, loadBalancer, securityGroups } = this.state;

    return (
      <div className="details-panel">
        {loading && (
          <div className="header">
            <div className="close-button">
              <a className="btn btn-link" onClick={this.autoClose}>
                <span className="glyphicon glyphicon-remove"></span>
              </a>
            </div>
            <div className="horizontal center middle spinner-container">
              <LoadingSpinner></LoadingSpinner>
            </div>
          </div>
        )}
        {!loading && (
          <div className="header">
            <div className="close-button">
              <a className="btn btn-link">
                <span className="glyphicon glyphicon-remove"></span>
              </a>
            </div>
            <div className="header-text horizontal middle">
              <i className="fa icon-sitemap"></i>
              <h3 className="horizontal middle space-between flex-1">{loadBalancer.name}</h3>
            </div>

            <div>
              <div className="actions">
                <LoadBalancerActions
                  app={app}
                  loadBalancer={loadBalancer}
                  loadBalancerFromParams={loadBalancer}
                ></LoadBalancerActions>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="content">
            <CollapsibleSection heading="Load Balancer Details" defaultExpanded={true}>
              <dl className="dl-horizontal dl-flex">
                <dt>Created</dt>
                <dd>{loadBalancer.createTime}</dd>
                <dt>In</dt>
                <dd>
                  <AccountTag account={loadBalancer.account} /> {loadBalancer.region}
                </dd>
                <dt>VPC</dt>
                <dd>
                  <VpcTag vpcId={loadBalancer.elb && loadBalancer.elb.vpcId}></VpcTag>
                </dd>
                {loadBalancer.subnetId && <dt>Subnet</dt>}
                {loadBalancer.subnetId && <dd> {loadBalancer.subnetId} </dd>}
                {loadBalancer.loadBalancerType && <dt>Type</dt>}
                {loadBalancer.loadBalancerType && <dd> {loadBalancer.loadBalancerType} </dd>}

                {loadBalancer.loadBalacnerVips && <dt>VIP</dt>}
                {loadBalancer.loadBalacnerVips &&
                  (loadBalancer.loadBalacnerVips || []).map((vip, index) => {
                    return <dd key={index}> {vip} </dd>;
                  })}
              </dl>
            </CollapsibleSection>

            <CollapsibleSection heading={`Listeners (${get(loadBalancer, 'listeners.length', 0)})`}>
              {(loadBalancer.listeners || []).map((item, index) => {
                return (
                  <dl className="dl-horizontal dl-flex" key={index}>
                    <dt>Listener Id</dt>
                    <dd>{item.listenerId}</dd>
                    {item.listenerName && <dt>Listener Name</dt>}

                    {item.listenerName && <dt>{item.listenerName}</dt>}
                    <dt>Protocol</dt>
                    <dd>{item.protocol}</dd>
                    <dt>Port</dt>
                    <dd>{item.port}</dd>
                  </dl>
                );
              })}
            </CollapsibleSection>

            <CollapsibleSection heading={firewallsLabel}>
              <ul>
                {(!securityGroups || !securityGroups.length) && <li>None</li>}
                {(securityGroups || []).map((securityGroup, index) => (
                  <li key={index}>
                    <a>
                      {securityGroup.name} {securityGroup.id}
                    </a>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
            <CollapsibleSection heading="Subnets">
              {(!loadBalancer.subnetDetails || loadBalancer.subnetDetails.length === 0) && (
                <div>
                  <h5>No subnets</h5>
                </div>
              )}

              {(loadBalancer.subnetDetails || []).map((subnet, index) => (
                <div key={index} className={index !== loadBalancer.subnetDetails.length - 1 ? 'bottom-border' : ''}>
                  <h5>
                    <strong>{subnet.id}</strong>
                  </h5>
                  <dl className="dl-horizontal dl-flex">
                    <dt>Name</dt>
                    <dd>{subnet.name}</dd>
                    <dt>Cidr Block</dt>
                    <dd>{subnet.cidrBlock}</dd>
                  </dl>
                </div>
              ))}
            </CollapsibleSection>
            {loadBalancer.loadBalancerType === 'classic' && (
              <CollapsibleSection heading="Health Checks">
                <dl className="horizontal-when-filters-collapsed">
                  <dt>Target</dt>
                  <dd>{get(loadBalancer, 'elb.healthCheck.target')}</dd>
                  <dt>Timeout</dt>
                  <dd>{get(loadBalancer, 'elb.healthCheck.timeout')} seconds</dd>
                  <dt>Interval</dt>
                  <dd>{get(loadBalancer, 'elb.healthCheck.interval')} seconds</dd>
                  <dt>Healthy Threshold</dt>
                  <dd>{get(loadBalancer, 'elb.healthCheck.healthyThreshold')}</dd>
                  <dt>Unhealthy Threshold</dt>
                  <dd>{get(loadBalancer, 'elb.healthCheck.unhealthyThreshold')}</dd>
                </dl>
              </CollapsibleSection>
            )}
          </div>
        )}
      </div>
    );
  }
}
