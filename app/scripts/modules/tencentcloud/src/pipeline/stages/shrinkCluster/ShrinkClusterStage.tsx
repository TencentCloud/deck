import * as React from 'react';
import { AccountService, IStageConfigProps, NgReact, StageConfigField } from '@spinnaker/core';
import { get } from 'lodash';
const { AccountRegionClusterSelector } = NgReact;

interface IProps extends IStageConfigProps {}
interface IState {
  accounts: any[];
  regionsLoaded: boolean;
}

export class ShrinkClusterStage extends React.Component<IProps, IState> {
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
    });

    if (!stage.credentials && application.defaultCredentials.tencentcloud) {
      updateStageField({
        credentials: application.defaultCredentials.tencentcloud,
      });
    }
    if (!get(stage, 'regions.length', 0) && application.defaultRegions.tencentcloud) {
      updateStageField({
        regions: [...stage.regions, application.defaultRegions.tencentcloud],
      });
    }

    if (stage.shrinkToSize === undefined) {
      updateStageField({
        shrinkToSize: 1,
      });
    }

    if (stage.allowDeleteActive === undefined) {
      updateStageField({
        allowDeleteActive: false,
      });
    }

    if (stage.retainLargerOverNewer === undefined) {
      updateStageField({
        retainLargerOverNewer: false,
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
        <StageConfigField label="Shrink Options">
          <div className="form-inline">
            Shrink to
            <input
              type="number"
              min="0"
              required
              value={stage.shrinkToSize}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateStageField({
                  shrinkToSize: Number(e.target.value),
                })
              }
              className="form-control input-sm"
              style={{ width: '50px' }}
            />
            {this.pluralize('server group', stage.shrinkToSize)}, keeping the
            <select
              className="form-control input-sm"
              value={stage.retainLargerOverNewer}
              onChange={(e: React.ChangeEvent<any>) => {
                updateStageField({
                  retainLargerOverNewer: e.target.value.toString(),
                });
              }}
              style={{ width: '100px' }}
            >
              <option value="true">largest</option>
              <option value="false">newest</option>
            </select>
          </div>
        </StageConfigField>
        <div className="form-group">
          <div className="col-md-offset-3 col-md-6 checkbox">
            <label>
              <input
                type="checkbox"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateStageField({
                    allowDeleteActive: e.target.checked,
                  });
                }}
                value={stage.allowDeleteActive}
              />
              Allow deletion of active server groups
            </label>
          </div>
        </div>
        {/*<StagePlatformHealthOverride application={application} stage={stage} platform-health-type="'Tencent'" />*/}
      </div>
    );
  }
}
