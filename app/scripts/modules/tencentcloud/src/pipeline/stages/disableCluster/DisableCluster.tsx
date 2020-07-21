import * as React from 'react';
import { AccountService, IStageConfigProps, NgReact, StageConfigField } from '@spinnaker/core';
import { get } from 'lodash';
const { AccountRegionClusterSelector } = NgReact;

interface IProps extends IStageConfigProps {}
interface IState {
  accounts: any[];
  regionsLoaded: boolean;
}

export class DisableCluster extends React.Component<IProps, IState> {
  public state: IState = {
    accounts: [],
    regionsLoaded: false,
  };

  public componentDidMount() {
    const { application, stage, updateStageField } = this.props;

    AccountService.listAccounts('tencentcloud').then(accounts => {
      this.setState({
        accounts,
      });
    });

    updateStageField({
      cloudProvider: 'tencentcloud',
      regions: stage.regions || [],
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
        credentials: get(application, 'defaultCredentials.tencentcloud'),
      });
    }

    if (!get(stage, 'regions.length') && get(application, 'defaultRegions.tencentcloud')) {
      updateStageField({
        regions: [...stage.regions, get(application, 'defaultRegions.tencentcloud')],
      });
    }

    if (stage.remainingEnabledServerGroups === undefined) {
      updateStageField({
        remainingEnabledServerGroups: 1,
      });
    }

    if (stage.preferLargerOverNewer === undefined) {
      updateStageField({
        preferLargerOverNewer: 'false',
      });
    }
  }

  private pluralize = function(str: string, val: any) {
    if (val === 1) {
      return str;
    }
    return str + 's';
  };

  public render() {
    const { application, pipeline, stage, updateStageField } = this.props;
    const { accounts } = this.state;
    return (
      <div className="form-horizontal">
        {!pipeline.strategy && (
          <AccountRegionClusterSelector
            application={application}
            clusterField={'cluster'}
            component={stage}
            accounts={accounts}
          />
        )}
        <StageConfigField label="Disable Options">
          <div className="form-inline">
            Keep the
            <input
              type="number"
              min="0"
              required
              value={stage.remainingEnabledServerGroups}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateStageField({
                  remainingEnabledServerGroups: Number(e.target.value),
                })
              }
              className="form-control input-sm"
              style={{ width: '50px', marginRight: '5px' }}
            />
            <select
              className="form-control input-sm"
              value={stage.preferLargerOverNewer}
              onChange={(e: React.ChangeEvent<any>) => {
                updateStageField({
                  preferLargerOverNewer: e.target.value.toString(),
                });
              }}
              style={{ width: '100px', marginRight: '5px' }}
            >
              <option value="true">largest</option>
              <option value="false">newest</option>
            </select>
            {this.pluralize('server group', stage.remainingEnabledServerGroups)} enabled.
          </div>
        </StageConfigField>
      </div>
    );
  }
}
