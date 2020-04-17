import * as React from 'react';
import { IExecutionDetailsSectionProps } from '@spinnaker/core';
import { get } from 'lodash';

interface IStage {}

export class TagImageExecutionDetails extends React.Component<IExecutionDetailsSectionProps, IStage> {
  public static title = 'Tag Image Config';

  render() {
    const tags: { [key: string]: string } = get(this.props, 'stage.context.tags', {});
    return (
      <div className="row">
        <div className="col-md-12">
          <dl className="dl-narrow dl-horizontal">
            <dt>Tags</dt>
            {Object.keys(tags).map((key: string) => (
              <dd>
                {key} = {tags[key]}
              </dd>
            ))}
          </dl>
        </div>
      </div>
    );
  }
}
