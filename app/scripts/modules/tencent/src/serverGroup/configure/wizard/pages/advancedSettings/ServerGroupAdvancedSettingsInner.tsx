import * as React from 'react';
import { FormikErrors } from 'formik';

import { IWizardPageComponent, Overridable } from '@spinnaker/core';

import { ITencentCloudServerGroupCommand } from '../../../serverGroupConfiguration.service';
import { ServerGroupAdvancedSettingsCommon } from './ServerGroupAdvancedSettingsCommon';
import { IServerGroupAdvancedSettingsProps } from './ServerGroupAdvancedSettings';

@Overridable('tencentCloud.serverGroup.advancedSettings')
export class ServerGroupAdvancedSettingsInner extends React.Component<IServerGroupAdvancedSettingsProps>
  implements IWizardPageComponent<ITencentCloudServerGroupCommand> {
  private validators = new Map();

  public validate = (values: ITencentCloudServerGroupCommand) => {
    const errors: FormikErrors<ITencentCloudServerGroupCommand> = {};

    this.validators.forEach(validator => {
      const subErrors = validator(values);
      Object.assign(errors, { ...subErrors });
    });

    return errors;
  };

  private handleRef = (ele: any) => {
    if (ele) {
      this.validators.set('common', ele.validate);
    } else {
      this.validators.delete('common');
    }
  };

  public render() {
    const { formik, app } = this.props;
    return <ServerGroupAdvancedSettingsCommon formik={formik} app={app} ref={this.handleRef as any} />;
  }
}
