import { IPipeline, Application } from '@spinnaker/core';

export interface IBakeStage {
  initialed: boolean;
  variables: {
    upgrade: boolean;
    repository: string;
  };
  account: string | number;
  manifest: any;
  region: string | number;
  zone: string | number;
  vpc: string | number;
  image_name: string | number;
  instance_type: string | number;
  disk_type: string | number;
  disk_size: string | number;
  image_copy_regions: string | number;
  ssh_username: string | number;

  package: string | number;
  packageArtifactIds: Array<number | string>;
  upgrade: boolean;
  repository: string | number;

  provisioners: any[];
}

export interface IStageConfigProps {
  application: Application;
  stage: IBakeStage;
  pipeline: IPipeline;
  configuration?: any;
  stageFieldUpdated: () => void;
  updateStage: (changes: { [key: string]: any }) => void;
  updateStageField: (changes: { [key: string]: any }) => void;
  // Added to enable inline artifact editing from React stages
  // todo(mneterval): remove after pre-rewrite artifacts are deprecated
  updatePipeline: (changes: { [key: string]: any }) => void;
}
