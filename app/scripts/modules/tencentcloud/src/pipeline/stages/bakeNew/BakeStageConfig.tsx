import * as React from 'react';

import { AccountService, yamlDocumentsToString, IAccount } from '@spinnaker/core';
// @ts-ignore
import { v1 as uuid } from 'uuid';
import { IStageConfigProps } from './define';
import { Subject, Observable } from 'rxjs';

import { VmSetting } from './VmSetting';
import { ArtifactSetting } from './ArtifactSetting';
import { ScriptSetting } from './ScriptSetting';

export interface IBakeStageConfigState {
  credentials: IAccount[];
  rawManifest?: string;
  artifacts: any[];
  files: any[];
  scripts: any[];
  account: string;
}

export class BakeStageConfig extends React.Component<IStageConfigProps> {
  public state: IBakeStageConfigState = {
    credentials: [],
    artifacts: [],
    files: [],
    scripts: [],
    account: '',
  };

  private destory$ = new Subject();

  public initRawManifest() {
    const { stage } = this.props;
    if (stage.manifest) {
      this.setState({ rawManifest: yamlDocumentsToString([stage.manifest]) });
    }
  }

  public componentWillUnmount(): void {
    this.destory$.next();
  }

  public componentDidMount() {
    Observable.fromPromise(AccountService.getAllAccountDetailsForProvider('tencentcloud'))
      .takeUntil(this.destory$)
      .subscribe((accounts: any) => {
        this.setState({ credentials: accounts });
      });
    this.initStage();
    this.initRawManifest();
  }

  private initStage = () => {
    const { updateStageField } = this.props;
    if (!this.props.stage.initialed) {
      updateStageField({
        initialed: true,
        cloudProviderType: 'tencentcloud',
        baseLabel: 'release',
        baseOs: 'CentOS',
        extendedAttributes: {},
        packageArtifactIds: [],
        package: '',
        manifest: {
          variables: {
            upgrade: 'false',
            repository: '',
          },
          builders: [
            {
              type: 'tencentcloud-cvm',
              secret_id: '',
              secret_key: '',
              region: '',
              zone: '',
              instance_type: '',
              source_image_id: '',
              image_name: `img-${uuid().slice(0, 5)}`,
              image_description: 'Spinnaker Packer Test',
              associate_public_ip_address: true,
              disk_type: 'CLOUD_PREMIUM',
              disk_size: 50,
              ssh_username: 'root',
              image_copy_regions: [],
              packer_debug: true,
              communicator: 'ssh',
            },
          ],
          provisioners: [
            {
              type: 'shell',
              script: '{{user `configDir`}}/install_packages.sh',
              environment_vars: [
                'repository={{user `repository`}}',
                'package_type={{user `package_type`}}',
                'packages={{user `packages`}}',
                'upgrade={{user `upgrade`}}',
              ],
              pause_before: '30s',
            },
          ],
        },
        rebake: true,
        user: (window as any).userInfo.name,
      });
    }
  };

  public render() {
    const { application, stage, updateStageField, pipeline } = this.props;

    return (
      <div className="container-fluid form-horizontal">
        <h4>虚拟机信息</h4>
        <VmSetting
          app={application}
          accounts={this.state.credentials}
          updateStageField={updateStageField}
          stage={stage}
        />

        <h4>制品信息</h4>
        <ArtifactSetting
          app={application}
          accounts={this.state.credentials}
          updateStageField={updateStageField}
          stage={stage}
          pipeline={pipeline}
        />
        <h4>文件与脚本</h4>
        <ScriptSetting
          app={application}
          accounts={this.state.credentials}
          updateStageField={updateStageField}
          stage={stage}
          pipeline={pipeline}
        />
      </div>
    );
  }
}
