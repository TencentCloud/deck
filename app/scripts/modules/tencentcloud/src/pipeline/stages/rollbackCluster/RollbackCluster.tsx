import * as React from 'react';
import { AccountService, IStageConfigProps, NgReact } from '@spinnaker/core';
import { get } from 'lodash';
const { AccountRegionClusterSelector } = NgReact;

interface IProps extends IStageConfigProps {}
interface IState {
  accounts: any[];
  regionsLoaded: boolean;
}

export class RollbackCluster extends React.Component<IProps, IState> {
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
      targetHealthyRollbackPercentage: stage.targetHealthyRollbackPercentage || 100,
      regions: stage.regions || [],
    });

    if (
      stage.isNew &&
      application.attributes.platformHealthOnlyShowOverride &&
      application.attributes.platformHealthOnly
    ) {
      updateStageField({
        interestingHealthProviderNames: ['Tencentcloud'],
      });
    }

    if (!stage.credentials && application.defaultCredentials.tencentcloud) {
      stage.credentials = application.defaultCredentials.tencentcloud;
      updateStageField({
        credentials: application.defaultCredentials.tencentcloud,
      });
    }
    if (!get(stage, 'regions', []).length && application.defaultRegions.tencentcloud) {
      updateStageField({
        regions: [...stage.regions, application.defaultCredentials.tencentcloud],
      });
    }
  }

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
        <div className="row">
          <div className="col-sm-10 col-sm-offset-2">
            Wait
            <input
              type="number"
              min="0"
              value={stage.waitTimeBetweenRegions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateStageField({
                  waitTimeBetweenRegions: Number(e.target.value),
                })
              }
              className="form-control input-sm inline-number"
              style={{ margin: '0 5px' }}
            />
            seconds between regional rollbacks.
          </div>
          <div className="col-sm-10 col-sm-offset-2">
            Consider rollback successful when
            <input
              type="number"
              min="0"
              max="100"
              value={stage.targetHealthyRollbackPercentage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateStageField({
                  targetHealthyRollbackPercentage: Number(e.target.value),
                })
              }
              className="form-control input-sm inline-number"
              style={{ margin: '0 5px' }}
            />
            percent of instances are healthy.
          </div>
        </div>
      </div>
    );
  }
}
