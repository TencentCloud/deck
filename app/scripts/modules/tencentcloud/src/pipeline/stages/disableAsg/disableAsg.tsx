import * as React from 'react';
import {
  AccountService,
  StageConstants,
  IStageConstant,
  NgReact,
  StageConfigField,
  IStageConfigProps,
  IAccount,
} from '@spinnaker/core';

const { AccountRegionClusterSelector, TargetSelect } = NgReact;

interface IProps extends IStageConfigProps {}
interface IState {
  targets: IStageConstant[];
  accounts?: IAccount[];
}
export class DisbaleAgsStage extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      targets: StageConstants.TARGET_LIST,
      accounts: [],
    };
  }

  componentDidMount() {
    const { updateStageField, stage, application } = this.props;
    const { targets } = this.state;
    AccountService.listAccounts('tencentcloud').then(accounts => {
      this.setState({
        accounts,
      });
    });
    updateStageField({
      regions: stage.regions || [],
      cloudProvider: 'tencentcloud',
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
    }
    if (!stage.regions.length && application.defaultRegions.tencentcloud) {
      stage.regions.push(application.defaultRegions.tencentcloud);
    }

    if (!stage.target) {
      updateStageField({
        target: targets[0].val,
      });
    }
  }

  private targetUpdated = (target: string) => {
    this.props.updateStageField({ target });
  };

  render() {
    const { accounts, targets } = this.state;
    const { stage, application, pipeline } = this.props;
    const { target } = stage;
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
        <StageConfigField label="Target">
          <TargetSelect model={{ target }} options={targets} onChange={this.targetUpdated} />
        </StageConfigField>
      </div>
    );
  }
}
