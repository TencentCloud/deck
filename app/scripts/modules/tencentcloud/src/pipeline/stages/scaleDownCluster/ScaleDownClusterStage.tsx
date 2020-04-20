import * as React from 'react';
import { AccountService, IStageConfigProps, NgReact, StageConfigField } from '@spinnaker/core';
import { get } from 'lodash';
const { AccountRegionClusterSelector } = NgReact;

interface IProps extends IStageConfigProps {}
interface IState {
  accounts: any[];
  regionsLoaded: boolean;
}

export class ScaleDownClusterStage extends React.Component<IProps, IState> {
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

    if (stage.remainingFullSizeServerGroups === undefined) {
      updateStageField({
        remainingFullSizeServerGroups: 1,
      });
    }

    if (stage.allowScaleDownActive === undefined) {
      updateStageField({
        allowScaleDownActive: false,
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
        <StageConfigField label="Scale Down Options">
          <div className="form-inline">
            <p>
              Keep the
              <input
                type="number"
                min="0"
                required
                value={stage.remainingFullSizeServerGroups}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateStageField({
                    remainingFullSizeServerGroups: Number(e.target.value),
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
              {this.pluralize('server group', stage.remainingFullSizeServerGroups)} at current size.
            </p>
            <p>The remaining server groups will be scaled down to zero instances.</p>
          </div>
        </StageConfigField>
        <div className="form-group">
          <div className="col-md-offset-3 col-md-6 checkbox">
            <label>
              <input
                type="checkbox"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateStageField({
                    allowScaleDownActive: e.target.checked,
                  });
                }}
                value={stage.allowScaleDownActive}
              />
              Allow scale down of active server groups
            </label>
          </div>
        </div>
      </div>
    );
  }
}
