import * as React from 'react';
import './style.less';

import { Application, IAccount, TextInput, RadioButtonInput, ReactSelectInput, IPipeline } from '@spinnaker/core';
import { IBakeStage } from './define';
import { get } from 'lodash';

export interface IArtifactSettingsProps {
  app?: Application;
  accounts: IAccount[];
  account?: string;
  updateStageField: (state: { [key: string]: any }) => void;
  stage: IBakeStage;
  pipeline: IPipeline;
}

export function ArtifactSetting(props: IArtifactSettingsProps) {
  const { stage, updateStageField, pipeline } = props;

  return (
    <div className="form-horizontal">
      <div className="form-group">
        <div className="col-md-3 sm-label-right">外部 package</div>
        <div className="col-md-7">
          <TextInput
            value={get(stage, 'package')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateStageField({
                package: e.target.value,
              });
            }}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">制品库制品</div>
        {get(stage, 'packageArtifactIds', []).map((item: number, index: number) => (
          <div key={index} className={`col-md-7 wrap-selector  ${index > 0 ? 'col-md-offset-3' : ''} `}>
            <div style={{ width: '90%' }}>
              <ReactSelectInput
                clearable={false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const packageArtifactIds = [...get(stage, 'packageArtifactIds', [])];
                  packageArtifactIds.splice(index, 1, e.target.value);
                  updateStageField({
                    packageArtifactIds,
                  });
                }}
                value={item}
                options={get(pipeline, 'expectedArtifacts', []).map((it: { displayName: string; id: string }) => ({
                  label: it.displayName,
                  value: it.id,
                }))}
              />
            </div>
            <button
              style={{ display: 'inline-block' }}
              className="btn btn-sm btn-default"
              onClick={() => {
                const packageArtifactIds = [...get(stage, 'packageArtifactIds', [])];
                packageArtifactIds.splice(index, 1);
                updateStageField({
                  packageArtifactIds,
                });
              }}
            >
              <span className="glyphicon glyphicon-trash" />
            </button>
          </div>
        ))}
        <div className="col-md-7 col-md-offset-3">
          <button
            className="btn btn-block btn-add-trigger add-new"
            onClick={() => {
              const packageArtifactIds = [...get(stage, 'packageArtifactIds', []), null];
              updateStageField({
                packageArtifactIds,
              });
            }}
          >
            <span className="glyphicon glyphicon-plus-sign" />
            增加制品
          </button>
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">更新仓库</div>
        <div className="col-md-7">
          <RadioButtonInput
            inputClassName="radio-input"
            value={get(stage, 'manifest.variables.upgrade', 'false')}
            inline={true}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateStageField({
                manifest: {
                  ...stage.manifest,
                  variables: {
                    ...stage.variables,
                    upgrade: e.target.value,
                  },
                },
              });
            }}
            options={[
              { label: '是', value: 'true' },
              { label: '否', value: 'false' },
            ]}
          />
        </div>
      </div>

      <div className="form-group">
        <div className="col-md-3 sm-label-right">自定义仓库</div>
        <div className="col-md-7">
          <TextInput
            value={get(stage, 'manifest.variables.repository', '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateStageField({
                manifest: {
                  ...stage.manifest,
                  variables: {
                    ...stage.manifest.variables,
                    repository: e.target.value,
                  },
                },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
