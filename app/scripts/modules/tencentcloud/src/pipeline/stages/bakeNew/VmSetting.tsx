/* eslint-disable @typescript-eslint/camelcase */
import * as React from 'react';
import { IBakeStage } from './define';
import { Subject, Observable } from 'rxjs';

import { get, uniqBy } from 'lodash';

import './style.less';

import {
  Application,
  IAccount,
  IRegion,
  TextInput,
  AccountService,
  ReactSelectInput,
  ChecklistInput,
} from '@spinnaker/core';
import { TencentcloudImageReader } from 'tencentcloud/image/image.reader';
import { BakeStageService } from './bakeStage.service';

export interface IVmSettingsProps {
  app?: Application;
  accounts: IAccount[];
  account?: string;
  updateStageField: (state: { [key: string]: any }) => void;
  stage: IBakeStage;
}

export function VmSetting(props: IVmSettingsProps) {
  const destory = new Subject();
  const { updateStageField, stage } = props;
  const [regions, setRegions] = React.useState([]);
  const [zones, setZones] = React.useState([]);
  const [images, setImages] = React.useState([]);
  const [instanceTypes, setInstanceTypes] = React.useState([]);
  const tencentcloudImageReader = new TencentcloudImageReader();

  const findSecretIdByAccount = (account: string) => {
    return props.accounts.find(it => it.name === account).secretId;
  };

  const findSecretKeyByAccount = (account: string) => {
    return props.accounts.find(it => it.name === account).secretKey;
  };

  React.useEffect(() => {
    initRegions(get(stage, 'manifest.builders[0].account'));
    initInstanceTypes();
    initZones(get(stage, 'manifest.builders[0].account'), get(stage, 'manifest.builders[0].region'));
    initImages(get(stage, 'manifest.builders[0].account'));
    return () => {
      destory.next();
    };
  }, []);

  const initRegions = (account: string) => {
    Observable.fromPromise(AccountService.getRegionsForAccount(account))
      .takeUntil(destory)
      .subscribe((res: IRegion[]) => {
        setRegions(res.map(item => ({ label: item.name, value: item.name })));
      });
  };

  const initZones = (account: string, region: string) => {
    Observable.fromPromise(BakeStageService.getSubnets('tencentcloud'))
      .takeUntil(destory)
      .subscribe((res: any[]) => {
        setZones(
          Array.from(
            new Set(res.filter(item => item.account === account && item.region === region).map(item => item.zone)),
          ).map(item => ({ label: item, value: item })),
        );
      });
  };

  const initInstanceTypes = () => {
    Observable.fromPromise(BakeStageService.getInstanceTypes())
      .takeUntil(destory)
      .subscribe(
        (
          res: Array<{ account: string; name: string; region: string; mem: number; cpu: number; [key: string]: any }>,
        ) => {
          const insTypes = uniqBy(
            res
              .filter(item => item.region === get(stage, 'manifest.builders[0].region'))
              .map(item => ({ label: `${item.name}(${item.cpu}Core ${item.mem}GB)`, value: item.name })),
            'value',
          );

          setInstanceTypes(insTypes);
        },
      );
  };

  const initImages = (account: string) => {
    if (!account) {
      return;
    }
    Observable.fromPromise(
      tencentcloudImageReader.findImages({
        q: '',
        account,
        region: get(stage, 'manifest.builders[0].region'),
      }),
    )
      .takeUntil(destory)
      .subscribe(res => {
        setImages(
          res.map((item: any) => ({
            label: `${item.attributes.imageName}(${
              item.imgIds[get(stage, 'manifest.builders[0].region') as string][0]
            })`,
            value: item.imgIds[get(stage, 'manifest.builders[0].region') as string][0],
            os: item.attributes.osPlatform,
          })),
        );
      });
  };

  return (
    <div className="form-horizontal">
      <div className="form-group">
        <div className="col-md-3 sm-label-right">云账号</div>
        <div className="col-md-7">
          <ReactSelectInput
            clearable={false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              initRegions(e.target.value);
              initZones(e.target.value, get(stage, 'manifest.builders[0].region'));
              initImages(e.target.value);
              updateStageField({
                manifest: {
                  ...stage.manifest,
                  builders: [
                    {
                      ...stage.manifest.builders[0],
                      account: e.target.value,
                      secret_id: findSecretIdByAccount(e.target.value),
                      secret_key: findSecretKeyByAccount(e.target.value),
                    },
                  ],
                },
              });
            }}
            value={get(stage, 'manifest.builders[0].account')}
            options={props.accounts.map(item => ({ label: item.name, value: item.name }))}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">地域</div>
        <div className="col-md-7">
          <ReactSelectInput
            clearable={false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              initZones(get(stage, 'manifest.builders[0].account'), e.target.value);
              tencentcloudImageReader
                .findImages({
                  q: '',
                  account: get(stage, 'manifest.builders[0].account'),
                  region: e.target.value,
                })
                .then((res: any) => {
                  setImages(
                    res.map((item: any) => ({
                      label: `${item.attributes.imageName}(${
                        item.imgIds[get(stage, 'manifest.builders[0].region') as string][0]
                      })`,
                      value: item.imgIds[get(stage, 'manifest.builders[0].region') as string][0],
                      os: item.attributes.osPlatform,
                    })),
                  );
                });
              BakeStageService.getInstanceTypes().then((res: any) => {
                setInstanceTypes(
                  res
                    .filter((item: { account: string; region: string }) => item.region === e.target.value)
                    .map((item: { name: string }) => ({ label: item.name, value: item.name })),
                );
              });
              updateStageField({
                region: e.target.value,
                manifest: {
                  ...stage.manifest,
                  builders: [
                    {
                      ...stage.manifest.builders[0],
                      region: e.target.value,
                    },
                  ],
                },
              });
            }}
            value={get(stage, 'manifest.builders[0].region')}
            options={regions}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">可用区</div>
        <div className="col-md-7">
          <ReactSelectInput
            clearable={false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateStageField({
                zone: e.target.value,
                manifest: {
                  ...stage.manifest,
                  builders: [
                    {
                      ...stage.manifest.builders[0],
                      zone: e.target.value,
                    },
                  ],
                },
              });
            }}
            value={get(stage, 'manifest.builders[0].zone')}
            options={zones}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">镜像</div>
        <div className="col-md-7">
          <ReactSelectInput
            clearable={false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const os = get(
                images.find(image => image.value === e.target.value),
                'os',
              );
              updateStageField({
                baseOs: os,
                manifest: {
                  ...stage.manifest,
                  builders: [
                    {
                      ...stage.manifest.builders[0],
                      source_image_id: e.target.value,
                    },
                  ],
                },
              });
            }}
            value={get(stage, 'manifest.builders[0].source_image_id')}
            options={images}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">实例类型</div>
        <div className="col-md-7">
          <ReactSelectInput
            clearable={false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateStageField({
                manifest: {
                  ...stage.manifest,
                  builders: [
                    {
                      ...stage.manifest.builders[0],
                      instance_type: e.target.value,
                    },
                  ],
                },
              });
            }}
            value={get(stage, 'manifest.builders[0].instance_type')}
            options={instanceTypes}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">系统磁盘</div>
        <div className="col-md-7 wrap-selector">
          <div style={{ width: '80%' }}>
            <ReactSelectInput
              clearable={false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateStageField({
                  manifest: {
                    ...stage.manifest,
                    builders: [
                      {
                        ...stage.manifest.builders[0],
                        disk_type: e.target.value,
                      },
                    ],
                  },
                });
              }}
              value={get(stage, 'manifest.builders[0].disk_type')}
              options={[
                { label: '高性能云硬盘', value: 'CLOUD_PREMIUM' },
                { label: 'SSD 云硬盘', value: 'CLOUD_SSD' },
              ]}
            />
          </div>
          <div className="system-size">
            <TextInput
              value={get(stage, 'manifest.builders[0].disk_size')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateStageField({
                  manifest: {
                    ...stage.manifest,
                    builders: [
                      {
                        ...stage.manifest.builders[0],
                        disk_size: e.target.value,
                      },
                    ],
                  },
                });
              }}
            />
          </div>
          <div>GB</div>
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">复制到 region</div>
        <div className="col-md-7">
          <ChecklistInput
            inputClassName="radio-input"
            value={get(stage, 'manifest.builders[0].image_copy_regions', [])}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateStageField({
                manifest: {
                  ...stage.manifest,
                  builders: [
                    {
                      ...stage.manifest.builders[0],
                      image_copy_regions: e.target.value,
                    },
                  ],
                },
              });
            }}
            inline={true}
            options={regions}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">ssh username</div>
        <div className={'col-md-7'}>
          <TextInput
            value={get(stage, 'manifest.builders[0].ssh_username')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateStageField({
                manifest: {
                  ...stage.manifest,
                  builders: [
                    {
                      ...stage.manifest.builders[0],
                      ssh_username: e.target.value,
                    },
                  ],
                },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
