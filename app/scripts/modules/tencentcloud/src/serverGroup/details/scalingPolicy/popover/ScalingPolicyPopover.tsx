import * as React from 'react';
import { IScalingPolicy } from 'tencentcloud/domain';

interface Iprops extends IScalingPolicy {
  operator?: string;
  absAdjustment?: any;
}

const ScalingPolicyPopover = (props: Iprops) => {
  const {
    metricAlarm: alarm,
    stepAdjustments = [],
    adjustmentType,
    adjustmentValue,
    operator,
    absAdjustment,
    minAdjustmentMagnitude,
    cooldown,
    estimatedInstanceWarmup,
  } = props;
  let showWait = false;
  if (cooldown) {
    showWait = true;
  }
  if (stepAdjustments && stepAdjustments.length) {
    // @ts-ignore
    showWait = stepAdjustments[0].operator !== 'decrease';
  }
  return (
    <div>
      <dl className="dl-horizontal dl-narrow">
        <dt>Whenever</dt>
        <dd>
          {alarm.statistic} of {alarm.metricName} is
          <span></span> {alarm.threshold}
        </dd>
        <dt>for at least</dt>
        <dd>
          {alarm.continuousTime} consecutive periods of {alarm.period} seconds
        </dd>
        <dt>then</dt>
        {stepAdjustments.length > 0 && (
          <>
            <dd>
              {stepAdjustments.map((stepAdjustment: any, index: number) => (
                <div key={index}>
                  <span ng-if="policy.stepAdjustments.length > 1">
                    if {alarm.metricName}
                    {alarm.comparisonOperator.indexOf('Greater') === 0 && (
                      <span>
                        {stepAdjustment.metricIntervalUpperBound !== undefined &&
                          stepAdjustment.metricIntervalLowerBound !== undefined &&
                          `is between ${alarm.threshold +
                            stepAdjustment.metricIntervalLowerBound} and ${alarm.threshold +
                            stepAdjustment.metricIntervalUpperBound}`}
                        {stepAdjustment.metricIntervalUpperBound === undefined &&
                          `is greater than ${alarm.threshold + stepAdjustment.metricIntervalLowerBound}`}
                      </span>
                    )}
                    {alarm.comparisonOperator.indexOf('Less') === 0 && (
                      <span>
                        {stepAdjustment.metricIntervalUpperBound !== undefined &&
                          stepAdjustment.metricIntervalLowerBound !== undefined &&
                          `is between ${alarm.threshold +
                            stepAdjustment.metricIntervalLowerBound} and ${alarm.threshold +
                            stepAdjustment.metricIntervalUpperBound}`}
                        {stepAdjustment.metricIntervalUpperBound === undefined &&
                          `is less than ${alarm.threshold + stepAdjustment.metricIntervalLowerBound}`}
                      </span>
                    )}
                    ,
                  </span>

                  {adjustmentType === 'EXACT_CAPACITY' && (
                    <span>
                      set capacity to {stepAdjustment.adjustmentValue} instance
                      {stepAdjustment.adjustmentValue > 1 ? 's' : ''}
                    </span>
                  )}
                  {(adjustmentType === 'CHANGE_IN_CAPACITY' || adjustmentType === 'PERCENT_CHANGE_IN_CAPACITY') && (
                    <span>
                      {stepAdjustment.operator} capacity
                      {adjustmentType === 'PERCENT_CHANGE_IN_CAPACITY' ? `by ${stepAdjustment.absAdjustment}%` : ''}
                      {adjustmentType === 'CHANGE_IN_CAPACITY'
                        ? `by ${stepAdjustment.absAdjustment}% instance ${stepAdjustment.absAdjustment > 1 ? 's' : ''}`
                        : ''}
                    </span>
                  )}
                </div>
              ))}
            </dd>

            <dd>
              {adjustmentType === 'EXACT_CAPACITY' && (
                <span>
                  `set capacity to ${adjustmentValue} instance ${adjustmentValue > 1 ? 's' : ''}`
                </span>
              )}
              {(adjustmentType === 'CHANGE_IN_CAPACITY' || adjustmentType === 'PERCENT_CHANGE_IN_CAPACITY') && (
                <span>
                  {operator} capacity
                  {adjustmentType === 'PERCENT_CHANGE_IN_CAPACITY' ? `by ${absAdjustment}%` : ''}
                  {adjustmentType === 'CHANGE_IN_CAPACITY'
                    ? `by ${absAdjustment} instance ${absAdjustment > 1 ? 's' : ''}`
                    : ''}
                </span>
              )}
            </dd>
          </>
        )}
        {minAdjustmentMagnitude ? <dt>in</dt> : ''}
        {minAdjustmentMagnitude ? (
          <dd>
            increments of at least {minAdjustmentMagnitude} instance<span>s</span>
          </dd>
        ) : (
          ''
        )}
        {showWait ? <dt>wait</dt> : ''}
        {cooldown ? <dd ng-if="policy.cooldown">{cooldown} seconds before allowing another scaling activity.</dd> : ''}
        {showWait && estimatedInstanceWarmup ? (
          <dd>{estimatedInstanceWarmup} seconds to warm up after each step.</dd>
        ) : (
          ''
        )}
      </dl>
    </div>
  );
};

export default ScalingPolicyPopover;
