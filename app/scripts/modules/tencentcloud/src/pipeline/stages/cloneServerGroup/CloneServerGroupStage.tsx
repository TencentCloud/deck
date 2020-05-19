import * as React from 'react';
import {
  IStageConfigProps,
  NgReact,
  StageConfigField,
  StageConstants,
  HelpField,
  DeploymentStrategySelector,
  AccountService,
  AppListExtractor,
  NameUtils,
} from '@spinnaker/core';
import { get, first } from 'lodash';
const { AccountRegionClusterSelector, TargetSelect } = NgReact;

interface IProps extends IStageConfigProps {}

interface IState {
  loading: boolean;
  accounts: any[];
}

export class CloneServerGroupStage extends React.Component<IProps, IState> {
  public state: IState = {
    loading: false,
    accounts: [],
  };

  private cloneTargets = StageConstants.TARGET_LIST;

  public componentDidMount() {
    const { stage, updateStageField, application } = this.props;
    updateStageField({
      target: stage.target || this.cloneTargets[0].val,
      application: application.name,
      cloudProvider: 'tencentcloud',
      cloudProviderType: 'tencentcloud',
      stack: '',
    });

    if (
      stage.isNew &&
      get(application, 'attributes.platformHealthOnlyShowOverride') &&
      get(application, 'attributes.platformHealthOnly')
    ) {
      updateStageField({
        interestingHealthProviderNames: ['Tencentcloud'],
      });
    }

    if (!stage.credentials && get(application, 'defaultCredentials.tencentcloud')) {
      updateStageField({
        credentials: application.defaultCredentials.tencentcloud,
      });
    }

    if (stage.capacity === undefined) {
      updateStageField({
        capacity: {},
      });
    }

    if (stage.isNew) {
      updateStageField({
        useAmiBlockDeviceMappings: get(
          application,
          'attributes.providerSettings.tencentcloud.useAmiBlockDeviceMappings',
          false,
        ),
        copySourceCustomBlockDeviceMappings: false,
      });
    }

    if (stage.useSourceCapacity === undefined) {
      updateStageField({
        useSourceCapacity: true,
      });
    }
    this.setState({
      loading: true,
    });
    AccountService.listAccounts('tencentcloud').then(accounts => {
      this.setState({
        accounts,
        loading: false,
      });
    });
  }

  public componentWillReceiveProps(nextProps: IProps) {
    if (JSON.stringify(this.props.stage.targetCluster) !== JSON.stringify(nextProps.stage.targetCluster)) {
      this.targetClusterUpdated;
    }
  }

  private targetClusterUpdated = () => {
    const { stage, application, updateStageField } = this.props;
    if (stage.targetCluster) {
      const filterByCluster = AppListExtractor.monikerClusterNameFilter(stage.targetCluster);
      const moniker = first(AppListExtractor.getMonikers([application], filterByCluster));
      if (moniker) {
        updateStageField({
          stack: moniker.stack,
          detail: moniker.detail,
        });
      } else {
        const nameParts = NameUtils.parseClusterName(stage.targetCluster);
        stage.stack = nameParts.stack;
        stage.detail = nameParts.detail;
        updateStageField({
          stack: nameParts.stack,
          detail: nameParts.detail,
        });
      }
    } else {
      updateStageField({
        stack: '',
        detail: '',
      });
    }
  };

  private getBlockDeviceMappingsSource = () => {
    const { stage } = this.props;
    if (stage.copySourceCustomBlockDeviceMappings) {
      return 'source';
    } else if (stage.useAmiBlockDeviceMappings) {
      return 'ami';
    }
    return 'default';
  };

  private selectBlockDeviceMappingsSource = (selection: string) => {
    const { updateStageField } = this.props;
    if (selection === 'source') {
      updateStageField({
        copySourceCustomBlockDeviceMappings: true,
        useAmiBlockDeviceMappings: false,
      });
    } else if (selection === 'ami') {
      updateStageField({
        copySourceCustomBlockDeviceMappings: false,
        useAmiBlockDeviceMappings: true,
      });
    } else {
      updateStageField({
        copySourceCustomBlockDeviceMappings: false,
        useAmiBlockDeviceMappings: false,
      });
    }
  };

  render() {
    const { application, pipeline, stage, updateStageField } = this.props;
    const { accounts, loading } = this.state;
    return (
      <div>
        {!pipeline.strategy && (
          <div>
            {loading ? (
              <div className="horizontal center middle">loading ...</div>
            ) : (
              <div>
                <AccountRegionClusterSelector
                  application={application}
                  component={stage}
                  accounts={accounts}
                  singleRegion={'true'}
                  clusterField={'targetCluster'}
                />
              </div>
            )}
          </div>
        )}
        <StageConfigField label="Target">
          {
            // @ts-ignore
            <TargetSelect model={stage} options={this.cloneTargets} onChange={() => {}} />
          }
        </StageConfigField>
        <div>
          <div className="form-group">
            <div className="col-md-3 sm-label-right">Capacity</div>
            <div className="col-md-9 radio">
              <label>
                <input
                  type="radio"
                  value="true"
                  checked={stage.useSourceCapacity}
                  onChange={() => {
                    updateStageField({
                      useSourceCapacity: true,
                    });
                  }}
                  id="useSourceCapacityTrue"
                />
                Copy the capacity from the current server group
                <HelpField key="serverGroupCapacity.useSourceCapacityTrue" />
              </label>
            </div>
            <div className="col-md-9 col-md-offset-3 radio">
              <label>
                <input
                  type="radio"
                  value="false"
                  checked={!stage.useSourceCapacity}
                  id="useSourceCapacityFalse"
                  onChange={() => {
                    updateStageField({
                      useSourceCapacity: false,
                    });
                  }}
                />
                Let me specify the capacity
                <HelpField key="serverGroupCapacity.useSourceCapacityFalse"></HelpField>
              </label>
            </div>
          </div>
          <div className="form-group">
            <div className="col-md-2 col-md-offset-3">Min</div>
            <div className="col-md-2">Max</div>
            <div className="col-md-2">Desired</div>
          </div>
          <div className="form-group">
            <div className="col-md-2 col-md-offset-3">
              <input
                type="number"
                disabled={stage.useSourceCapacity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateStageField({
                    capacity: { ...stage.capacity, min: Number(e.target.value) },
                  });
                }}
                className="form-control input-sm"
                value={get(stage, 'capacity.min')}
                min="0"
                max={get(stage, 'capacity.max')}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                disabled={stage.useSourceCapacity}
                className="form-control input-sm"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateStageField({
                    capacity: { ...stage.capacity, max: Number(e.target.value) },
                  });
                }}
                value={get(stage, 'capacity.max')}
                min={get(stage, 'capacity.min')}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                disabled={stage.useSourceCapacity}
                className="form-control input-sm"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateStageField({
                    capacity: { ...stage.capacity, desired: Number(e.target.value) },
                  });
                }}
                value={get(stage, 'capacity.desired')}
                min={get(stage, 'capacity.min')}
                max={get(stage, 'capacity.max')}
                required
              />
            </div>
          </div>
        </div>
        <StageConfigField label="AMI Block Device Mappings">
          <div className="radio">
            <div>
              <label>
                <input
                  type="radio"
                  onChange={() => this.selectBlockDeviceMappingsSource('source')}
                  checked={this.getBlockDeviceMappingsSource() === 'source'}
                  name="blockDeviceMappingsSource"
                />
                Copy from current server group
                <HelpField key="tencentCloud.blockDeviceMappings.useSource" />
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  onChange={() => this.selectBlockDeviceMappingsSource('ami')}
                  checked={this.getBlockDeviceMappingsSource() === 'ami'}
                  name="blockDeviceMappingsSource"
                />
                Prefer AMI block device mappings
                <HelpField key="tencentCloud.blockDeviceMappings.useAMI" />
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  onChange={() => this.selectBlockDeviceMappingsSource('default')}
                  checked={this.getBlockDeviceMappingsSource() === 'default'}
                  name="blockDeviceMappingsSource"
                />
                Defaults for selected instance type
                <HelpField key="tencentCloud.blockDeviceMappings.useDefaults" />
              </label>
            </div>
          </div>
        </StageConfigField>
        {/*<stage-platform-health-override*/}
        {/*  application="application"*/}
        {/*  stage="stage"*/}
        {/*  platform-health-type="'Tencentcloud'"*/}
        {/*></stage-platform-health-override>*/}
        {/*<deployment-strategy-selector field-columns="6" command="stage"></deployment-strategy-selector>*/}
        {
          // @ts-ignore
          <DeploymentStrategySelector
            onFieldChange={() => {}}
            onStrategyChange={() => {}}
            command={stage}
            fieldColumns={6}
          />
        }
      </div>
    );
  }
}
