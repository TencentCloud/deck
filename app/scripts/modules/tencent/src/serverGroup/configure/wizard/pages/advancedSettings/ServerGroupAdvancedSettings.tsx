import * as React from 'react';
import { FormikProps } from 'formik';

import { Application, IWizardPageComponent } from '@spinnaker/core';

import { ITencentCloudServerGroupCommand } from '../../../serverGroupConfiguration.service';
import { ServerGroupAdvancedSettingsInner } from './ServerGroupAdvancedSettingsInner';

export interface IServerGroupAdvancedSettingsProps {
  app: Application;
  formik: FormikProps<ITencentCloudServerGroupCommand>;
}

export class ServerGroupAdvancedSettings extends React.Component<IServerGroupAdvancedSettingsProps>
  implements IWizardPageComponent<ITencentCloudServerGroupCommand> {
  private ref: any = React.createRef();

  public validate(values: ITencentCloudServerGroupCommand) {
    if (this.ref && this.ref.current) {
      return this.ref.current.validate(values);
    }
    return {};
  }

  public render() {
    const { app, formik } = this.props;
    return <ServerGroupAdvancedSettingsInner formik={formik} app={app} ref={this.ref} />;
  }
}
