import * as React from 'react';
import Select, { Option } from 'react-select';
import { FormikProps } from 'formik';

import { HelpField, IWizardPageComponent, ReactInjector } from '@spinnaker/core';

import { IAmazonServerGroupCommand } from '../../serverGroupConfiguration.service';

import { IALBListener } from 'tencent/domain';

export interface IServerGroupLoadBalancersProps {
  formik: FormikProps<IAmazonServerGroupCommand>;
}

export interface IServerGroupLoadBalancersState {
  refreshing: boolean;
  isL7: boolean;
  domain: string;
  domainList: string[];
  url: string;
  urlList: string[];
  selectedListener: IALBListener;
}

export class ServerGroupLoadBalancers
  extends React.Component<IServerGroupLoadBalancersProps, IServerGroupLoadBalancersState>
  implements IWizardPageComponent<IAmazonServerGroupCommand> {
  public state = {
    refreshing: false,
    isL7: false,
    domain: '',
    domainList: null as string[],
    url: '',
    urlList: null as string[],
    selectedListener: null as IALBListener,
  };

  public validate(values: IAmazonServerGroupCommand) {
    const errors = {} as any;
    const { isL7, domain, url } = this.state;
    if (values.viewState.dirty.loadBalancers) {
      errors.loadBalancers = 'You must confirm the removed load balancers.';
    }

    if (values.loadBalancerId && !values.listenerId) {
      errors.loadBalancers = 'Listener required.';
    }

    if (values.loadBalancerId && values.listenerId && isL7 && (!domain || !url)) {
      errors.loadBalancers = 'Domain and URL required.';
    }

    if (values.loadBalancerId && values.listenerId && (!values.port || !values.weight)) {
      errors.loadBalancers = 'Port and Weight required.';
    }

    return errors;
  }

  public refreshListeners = () => {
    const { values } = this.props.formik;
    this.setState({ refreshing: true });
    const configurationService: any = ReactInjector.providerServiceDelegate.getDelegate(
      values.cloudProvider || values.selectedProvider,
      'serverGroup.configurationService',
    );
    configurationService.refreshListeners(values).then(() => {
      this.setState({
        refreshing: false,
      });
    });
  };

  public clearWarnings(key: 'loadBalancers'): void {
    this.props.formik.values.viewState.dirty[key] = null;
    this.props.formik.validateForm();
  }

  private isL7 = (protocol: string): boolean => {
    return protocol === 'HTTP' || protocol === 'HTTPS';
  };

  private loadBalancersChanged = (option: Option<string>) => {
    this.props.formik.values.loadBalancerId = option.value;
    this.props.formik.setFieldValue('loadBalancerId', option.value);
    this.props.formik.setFieldValue('listenerId', '');
    this.props.formik.setFieldValue('locationId', '');
    this.refreshListeners();
  };

  private listenerChanged = (option: Option<string>) => {
    this.props.formik.values.listenerId = option.value;
    this.props.formik.setFieldValue('listenerId', option.value);
    this.props.formik.setFieldValue('locationId', '');
    const selectedListener = this.props.formik.values.backingData.filtered.listenerList.find(
      item => item.listenerId === option.value,
    );
    this.setState({
      domain: '',
      url: '',
      selectedListener,
      isL7: this.isL7(selectedListener.protocol),
      domainList: this.getDomainList(selectedListener),
    });
  };

  private domainChanged = (option: Option<string>) => {
    const { selectedListener } = this.state;
    this.props.formik.setFieldValue('locationId', '');
    this.setState({
      domain: option.value,
      url: '',
      urlList: this.getUrlList(selectedListener, option.value),
    });
  };

  private urlChanged = (option: Option<string>) => {
    const { selectedListener, domain } = this.state;
    const rule = selectedListener.rules.find(r => r.domain === domain && r.url === option.value);
    this.props.formik.setFieldValue('locationId', rule.locationId);
    this.setState({
      url: option.value,
    });
  };

  private getDomainList = (selectedListener: IALBListener): string[] => {
    return selectedListener.rules && selectedListener.rules.length
      ? [...new Set(selectedListener.rules.map(rule => rule.domain))]
      : [];
  };

  private getUrlList = (selectedListener: IALBListener, domain: string): string[] => {
    return selectedListener && selectedListener.rules && selectedListener.rules.length
      ? selectedListener.rules.filter(r => r.domain === domain).map(r => r.url)
      : [];
  };

  public componentWillReceiveProps(nextProps: IServerGroupLoadBalancersProps): void {
    const {
      values: {
        listenerId,
        locationId,
        backingData: {
          filtered: { listenerList = [] },
        },
      },
    } = nextProps.formik;
    if (locationId && listenerList && listenerList.length) {
      const selectedListener = listenerList.find(l => l.listenerId === listenerId);
      const rule = selectedListener && selectedListener.rules.find(r => r.locationId === locationId);
      if (rule) {
        this.setState({
          domain: rule.domain,
          url: rule.url,
          isL7: this.isL7(selectedListener.protocol),
          domainList: this.getDomainList(selectedListener),
          urlList: this.getUrlList(selectedListener, rule.domain),
        });
      }
    }
  }

  public render() {
    const { values, setFieldValue } = this.props.formik;
    const { dirty } = values.viewState;
    const { refreshing, domain, domainList, url, urlList, isL7 } = this.state;
    const loadBalancerOptions: Option[] = (values.backingData.filtered.lbList || []).map(lb => ({
      label: `${lb.name}(${lb.id})`,
      value: lb.id,
    }));
    const listenerOptions: Option[] = (values.backingData.filtered.listenerList || []).map(lb => ({
      label: `${lb.listenerName}(${lb.listenerId})`,
      value: lb.listenerId,
    }));
    return (
      <div className="container-fluid form-horizontal">
        {dirty.loadBalancers && (
          <div className="col-md-12">
            <div className="alert alert-warning">
              <p>
                <i className="fa fa-exclamation-triangle" />
                The following load balancers could not be found in the selected account/region/VPC and were removed:
              </p>
              <ul>
                {dirty.loadBalancers.map(lb => (
                  <li key={lb}>{lb}</li>
                ))}
              </ul>
              <p className="text-right">
                <a
                  className="btn btn-sm btn-default dirty-flag-dismiss clickable"
                  onClick={() => this.clearWarnings('loadBalancers')}
                >
                  Okay
                </a>
              </p>
            </div>
          </div>
        )}
        <div className="form-group">
          <div className="col-md-3 sm-label-right">
            <b>Load Balancers </b>
            <HelpField id="aws.loadBalancer.loadBalancers" />
          </div>
          <div className="col-md-7">
            {loadBalancerOptions.length === 0 && (
              <div className="form-control-static">No load balancers found in the selected account/region/VPC</div>
            )}
            {loadBalancerOptions.length > 0 && (
              <Select
                value={values.loadBalancerId}
                required={true}
                clearable={false}
                options={loadBalancerOptions}
                onChange={this.loadBalancersChanged}
              />
            )}
          </div>
        </div>
        {!!values.loadBalancerId && (
          <div className="form-group">
            <div className="col-md-3 sm-label-right">
              <b>Listeners</b>
            </div>
            <div className="col-md-7">
              <Select
                isLoading={refreshing}
                value={values.listenerId}
                required={true}
                clearable={false}
                options={listenerOptions}
                onChange={this.listenerChanged}
              />
            </div>
          </div>
        )}
        {!!values.loadBalancerId && !!values.listenerId && isL7 && (
          <div className="form-group">
            <div className="col-md-3 sm-label-right">
              <b>Domain</b>
            </div>
            <div className="col-md-7">
              <Select
                value={domain}
                required={true}
                clearable={false}
                options={domainList.map(d => ({ label: d, value: d }))}
                onChange={this.domainChanged}
              />
            </div>
          </div>
        )}
        {!!values.loadBalancerId && !!values.listenerId && isL7 && domain && (
          <div className="form-group">
            <div className="col-md-3 sm-label-right">
              <b>URL</b>
            </div>
            <div className="col-md-7">
              <Select
                value={url}
                required={true}
                clearable={false}
                options={urlList.map(u => ({ label: u, value: u }))}
                onChange={this.urlChanged}
              />
            </div>
          </div>
        )}
        {!!values.loadBalancerId && !!values.listenerId && (
          <div className="form-group">
            <div className="col-md-3 sm-label-right">
              <b>Port and Weight</b>
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control input-sm"
                value={values.port || ''}
                min={1}
                max={65535}
                placeholder="1~65535"
                onChange={e => setFieldValue('port', parseInt(e.target.value, 10))}
                required={true}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control input-sm"
                value={values.weight || ''}
                min={1}
                max={100}
                placeholder="1~100"
                onChange={e => setFieldValue('weight', parseInt(e.target.value, 10))}
                required={true}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
