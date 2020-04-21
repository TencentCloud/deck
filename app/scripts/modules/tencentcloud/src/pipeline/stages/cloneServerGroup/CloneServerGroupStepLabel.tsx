import * as React from 'react';

interface IProps {}

interface IState {}

export class CloneServerGroupStepLabel extends React.Component<IProps, IState> {
  render() {
    return (
      <span className="task-label">
        {/*Clone Server Group: {{ step.context.source.serverGroupName }} ({{ step.context.region }})*/}
        Clone Server Group:
      </span>
    );
  }
}
