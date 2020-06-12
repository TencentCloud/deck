import * as React from 'react';
import './style.less';

import { Application, IAccount, RadioButtonInput, TextAreaInput, TextInput } from '@spinnaker/core';
import { IPipeline } from 'core/domain';

import { ReactSelectInput } from 'core/presentation';
import { IBakeStage } from 'tencentcloud/pipeline/stages/bakeNew/define';
import { get } from 'lodash';

export interface IFileProps {
  app?: Application;
  accounts: IAccount[];
  account?: string;
  updateStageField: (state: { [key: string]: any }) => void;
  stage: IBakeStage;
  pipeline: IPipeline;
}

const typeOptions = [
  { label: '文件', value: 'file' },
  { label: '脚本', value: 'shell' },
];
const subTypeOptions = [
  { label: '制品', value: 'artifact' },
  { label: '文本', value: 'text' },
];

export function ScriptSetting(props: IFileProps) {
  const { stage, updateStageField, pipeline } = props;

  return (
    <div className="form-horizontal">
      <div className="form-group">
        {get(stage, 'manifest.provisioners', [])
          .slice(1)
          .map((item, index: number) => (
            <div key={index}>
              <div className="col-md-3 sm-label-right">类型</div>
              <div className="col-md-7">
                <RadioButtonInput
                  inputClassName={'radio-input'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const provisioners = [...stage.manifest.provisioners];
                    provisioners.splice(index + 1, 1, {
                      type: e.target.value,
                    });
                    updateStageField({
                      manifest: {
                        ...stage.manifest,
                        provisioners,
                      },
                    });
                  }}
                  inline={true}
                  value={item.type}
                  options={typeOptions}
                />
              </div>
              {item.type === 'shell' && (
                <>
                  <div className="col-md-3 sm-label-right">来源</div>
                  <div className="col-md-7">
                    <RadioButtonInput
                      inputClassName={'radio-input'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const provisioners = [...stage.manifest.provisioners];
                        provisioners.splice(index + 1, 1, {
                          type: 'shell',
                          sub_type: e.target.value,
                        });
                        updateStageField({
                          manifest: {
                            ...stage.manifest,
                            provisioners,
                          },
                        });
                      }}
                      inline={true}
                      value={item.sub_type}
                      options={subTypeOptions}
                    />
                  </div>
                </>
              )}

              {item.type === 'file' && (
                <div>
                  <div className="col-md-3 sm-label-right">文件</div>
                  <div className="col-md-7 wrap-selector">
                    <div style={{ width: '90%' }}>
                      <ReactSelectInput
                        clearable={false}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const provisioners = [...get(stage, 'manifest.provisioners', [])];
                          provisioners.splice(index + 1, 1, {
                            ...item,
                            source: `{{artifact \`${e.target.value}\`}}`,
                          });
                          updateStageField({
                            manifest: {
                              ...stage.manifest,
                              provisioners,
                            },
                          });
                        }}
                        value={get(item, 'source', '').replace(/{{artifact `(.*)`}}/, '$1')}
                        options={get(pipeline, 'expectedArtifacts', []).map(
                          (it: { displayName: string; id: string }) => ({
                            label: it.displayName,
                            value: it.id,
                          }),
                        )}
                      />
                    </div>
                    <button
                      style={{ display: 'inline-block' }}
                      className="btn btn-sm btn-default"
                      onClick={() => {
                        const provisioners = [...get(stage, 'manifest.provisioners', [])];
                        provisioners.splice(index + 1, 1);
                        updateStageField({
                          manifest: {
                            ...stage.manifest,
                            provisioners,
                          },
                        });
                      }}
                    >
                      <span className="glyphicon glyphicon-trash" />
                    </button>
                  </div>
                  <div className="col-md-3 sm-label-right">复制到</div>
                  <div className="col-md-7 wrap-selector">
                    <TextInput
                      value={item.destination}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const provisioners = [...get(stage, 'manifest.provisioners', [])];
                        provisioners.splice(index + 1, 1, {
                          ...item,
                          destination: e.target.value,
                        });
                        updateStageField({
                          manifest: {
                            ...stage.manifest,
                            provisioners,
                          },
                        });
                      }}
                    />
                  </div>
                </div>
              )}

              {item.sub_type === 'artifact' && (
                <div>
                  <div className="col-md-3 sm-label-right">脚本制品</div>
                  <div className="col-md-7 wrap-selector">
                    <div style={{ width: '90%' }}>
                      <ReactSelectInput
                        clearable={false}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const provisioners = [...get(stage, 'manifest.provisioners', [])];
                          provisioners.splice(index + 1, 1, {
                            ...item,
                            script: `{{artifact \`${e.target.value}\`}}`,
                            pause_before: '1s',
                          });
                          updateStageField({
                            manifest: {
                              ...stage.manifest,
                              provisioners,
                            },
                          });
                        }}
                        value={get(item, 'script', '').replace(/{{artifact `(.*)`}}/, '$1')}
                        options={get(pipeline, 'expectedArtifacts', []).map(
                          (it: { displayName: string; id: string }) => ({
                            label: it.displayName,
                            value: it.id,
                          }),
                        )}
                      />
                    </div>
                    <button
                      style={{ display: 'inline-block' }}
                      className="btn btn-sm btn-default"
                      onClick={() => {
                        const provisioners = [...get(stage, 'manifest.provisioners', [])];
                        provisioners.splice(index + 1, 1);
                        updateStageField({
                          manifest: {
                            ...stage.manifest,
                            provisioners,
                          },
                        });
                      }}
                    >
                      <span className="glyphicon glyphicon-trash" />
                    </button>
                  </div>
                </div>
              )}
              {item.sub_type === 'text' && (
                <div>
                  <div className="col-md-3 sm-label-right">脚本</div>
                  <div className="col-md-7 wrap-selector">
                    <div style={{ width: '90%' }}>
                      <TextAreaInput
                        value={get(item, 'inline', []).join('\n')}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const provisioners = [...get(stage, 'manifest.provisioners', [])];
                          provisioners.splice(index + 1, 1, {
                            ...item,
                            inline: e.target.value.split('\n'),
                            pause_before: '1s',
                          });
                          updateStageField({
                            manifest: {
                              ...stage.manifest,
                              provisioners,
                            },
                          });
                        }}
                      />
                    </div>
                    <button
                      style={{ display: 'inline-block' }}
                      className="btn btn-sm btn-default"
                      onClick={() => {
                        const provisioners = [...get(stage, 'manifest.provisioners', [])];
                        provisioners.splice(index + 1, 1);
                        updateStageField({
                          manifest: {
                            ...stage.manifest,
                            provisioners,
                          },
                        });
                      }}
                    >
                      <span className="glyphicon glyphicon-trash" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        <div className="col-md-7 col-md-offset-3">
          <button
            className="btn btn-block btn-add-trigger add-new"
            onClick={() => {
              updateStageField({
                manifest: {
                  ...stage.manifest,
                  provisioners: [
                    ...get(stage, 'manifest.provisioners', []),
                    {
                      sub_type: 'file',
                      type: 'file',
                    },
                  ],
                },
              });
            }}
          >
            <span className="glyphicon glyphicon-plus-sign" /> 增加文件或脚本
          </button>
        </div>
      </div>
    </div>
  );
}
