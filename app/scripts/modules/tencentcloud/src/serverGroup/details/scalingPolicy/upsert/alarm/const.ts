export const statistics = ['AVERAGE', 'MAXIMUM', 'MINIMUM'];

export const comparators = [
  {
    label: '>=',
    value: 'GREATER_THAN_OR_EQUAL_TO',
  },
  {
    label: '>',
    value: 'GREATER_THAN',
  },
  {
    label: '<=',
    value: 'LESS_THAN_OR_EQUAL_TO',
  },
  {
    label: '<',
    value: 'LESS_THAN',
  },
];

export const periods = [
  {
    label: '1 minute',
    value: '60',
  },
  {
    label: '5 minutes',
    value: `${60 * 5}`,
  },
  {
    label: '15 minutes',
    value: `${60 * 15}`,
  },
  {
    label: '1 hour',
    value: `${60 * 60}`,
  },
  {
    label: '4 hours',
    value: `${60 * 60 * 4}`,
  },
  {
    label: '1 day',
    value: `${60 * 60 * 24}`,
  },
];
