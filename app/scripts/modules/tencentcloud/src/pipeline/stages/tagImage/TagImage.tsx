import * as React from 'react';
import { IStageConfigProps, StageConfigField, TextInput } from '@spinnaker/core';
import { get } from 'lodash';

import './style.less';

interface ITagImageProps extends IStageConfigProps {}

interface ITagImageState {}

export class TagImage extends React.Component<ITagImageProps, ITagImageState> {
  public state: ITagImageState = {};

  render() {
    const { stage, updateStageField } = this.props;
    const tags = get(stage, 'tags', {});
    return (
      <div className="form-horizontal">
        <StageConfigField label="Tags">
          <>
            <div className={'tag-image-label'}>
              <div>Key</div>
              <div>Values</div>
            </div>
            <div>
              {Object.keys(tags).map((key: string, index: number) => (
                <div key={index} className={'input-group-row'}>
                  <TextInput
                    value={key}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const tagsBak = { ...tags };
                      const val = (tagsBak as any)[key];
                      delete (tagsBak as any)[key];
                      (tagsBak as any)[e.target.value] = val;
                      updateStageField({
                        tags: tagsBak,
                      });
                    }}
                  />
                  <TextInput
                    value={(tags as any)[key]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const tagsBak = { ...tags };
                      (tagsBak as any)[key] = e.target.value;
                      updateStageField({
                        tags: tagsBak,
                      });
                    }}
                  />
                  <button
                    style={{ display: 'inline-block', marginLeft: '10px' }}
                    className="btn btn-sm btn-default"
                    onClick={() => {
                      const tagBak = { ...tags };
                      delete (tagBak as any)[key];
                      updateStageField({
                        tags: tagBak,
                      });
                    }}
                  >
                    <span className="glyphicon glyphicon-trash" />
                  </button>
                </div>
              ))}
              <button
                className="btn btn-block btn-add-trigger add-new"
                onClick={() => {
                  updateStageField({
                    tags: { ...tags, '': '' },
                  });
                }}
              >
                <span className="glyphicon glyphicon-plus-sign" />
                Add Field
              </button>
            </div>
          </>
        </StageConfigField>
      </div>
    );
  }
}
