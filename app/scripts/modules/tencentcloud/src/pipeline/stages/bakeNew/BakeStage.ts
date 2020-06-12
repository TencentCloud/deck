import {
  Registry,
  IPipeline,
  IStage,
  IValidatorConfig,
  IStageOrTriggerTypeConfig,
  ICustomValidator,
  BakeExecutionLabel,
} from '@spinnaker/core';

import { BakeStageConfig } from './BakeStageConfig';

Registry.pipeline.registerStage({
  key: 'bake',
  cloudProvider: 'tencentcloud',
  label: 'Bake',
  description: 'Bakes an image',
  alias: 'bake',
  addAliasToConfig: true,
  component: BakeStageConfig,
  executionDetailsUrl: require('./bakeExecutionDetails.html'),
  executionLabelComponent: BakeExecutionLabel,
  supportsCustomTimeout: true,
  producesArtifacts: true,
  validators: [
    {
      type: 'custom',
      validate: (
        _pipeline: IPipeline,
        stage: IStage,
        _validator: IValidatorConfig,
        _config: IStageOrTriggerTypeConfig,
      ): string => {
        if (!stage.manifest || !stage.manifest.kind) {
          return '';
        }
        if (stage.manifest.kind !== 'Job') {
          return 'Run Job (Manifest) only accepts manifest of kind Job.';
        }
        return '';
      },
    } as ICustomValidator,
  ],
});
