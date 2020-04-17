import { module } from 'angular';

import {
  ArtifactReferenceService,
  ExecutionDetailsTasks,
  ExpectedArtifactService,
  IStage,
  Registry,
  IStageTypeConfig,
} from '@spinnaker/core';

import { DeployCloudFormationStackConfigController } from './deployCloudFormationStackConfig.controller';

export const DEPLOY_CLOUDFORMATION_STACK_STAGE = 'spinnaker.tencentcloud.pipeline.stages.deployCloudFormationStage';

module(DEPLOY_CLOUDFORMATION_STACK_STAGE, [])
  .config(() => {
    Registry.pipeline.registerStage({
      label: 'Deploy (CloudFormation Stack)',
      description: 'Deploy a CloudFormation Stack',
      key: 'deployCloudFormation',
      cloudProvider: 'tencentcloud',
      templateUrl: require('./deployCloudFormationStackConfig.html'),
      controller: 'DeployCloudFormationStackConfigController',
      controllerAs: 'ctrl',
      executionDetailsSections: [ExecutionDetailsTasks],
      producesArtifacts: true,
      defaultTimeoutMs: 30 * 60 * 1000, // 30 minutes
      validators: [],
      accountExtractor: (stage: IStage): string[] => (stage.account ? stage.account : ''),
      configAccountExtractor: (stage: any): string[] => (stage.account ? [stage.account] : []),
      artifactExtractor: ExpectedArtifactService.accumulateArtifacts(['stackArtifactId', 'requiredArtifactIds']),
      artifactRemover: ArtifactReferenceService.removeArtifactFromFields(['stackArtifactId', 'requiredArtifactIds']),
    } as IStageTypeConfig);
  })
  .controller('DeployCloudFormationStackConfigController', DeployCloudFormationStackConfigController);
