import * as React from 'react';

import { Application } from '@spinnaker/core';

import { TencentCloudReactInjector } from 'tencentcloud/reactShims';
import { ITencentCloudServerGroupView } from 'tencentcloud/domain';
import UpsertScalingPlicyModal from './upsert/UpsertScalingPlicyModal';

export interface ICreateScalingPolicyButtonProps {
  application: Application;
  serverGroup: ITencentCloudServerGroupView;
}

export interface ICreateScalingPolicyButtonState {
  showSelection: boolean;
  showModal: boolean;
  typeSelection: string;
}

export class CreateScalingPolicyButton extends React.Component<
  ICreateScalingPolicyButtonProps,
  ICreateScalingPolicyButtonState
> {
  constructor(props: ICreateScalingPolicyButtonProps) {
    super(props);
    this.state = {
      showSelection: false,
      showModal: false,
      typeSelection: null,
    };
  }

  public handleClick = (): void => {
    this.setState({ showSelection: true });
  };

  public createStepPolicy(): void {
    const { serverGroup, application } = this.props;
    UpsertScalingPlicyModal.show({
      serverGroup,
      application,
      policy: TencentCloudReactInjector.tencentCloudServerGroupTransformer.constructNewStepScalingPolicyTemplate(),
    });
  }

  public typeSelected = (typeSelection: string): void => {
    this.setState({ typeSelection, showSelection: false, showModal: true });
    if (typeSelection === 'step') {
      this.createStepPolicy();
    }
  };

  public showModalCallback = (): void => {
    this.setState({ showSelection: false, showModal: false, typeSelection: null });
  };

  public render() {
    return (
      <div>
        <a
          className="clickable"
          onClick={() => {
            this.typeSelected('step');
          }}
        >
          Create new scaling policy
        </a>
      </div>
    );
  }
}
