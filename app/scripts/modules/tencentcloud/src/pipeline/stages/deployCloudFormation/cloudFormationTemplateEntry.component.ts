import { IComponentOptions, IController, IScope, module } from 'angular';

class CloudFormationTemplateController implements IController {
  public command: any;
  public templateBody: any;
  public rawTemplateBody: string;

  public static $inject = ['$scope'];
  constructor(private $scope: IScope) {
    'ngInject';
  }

  public $onInit = (): void => {
    this.rawTemplateBody = JSON.stringify(this.command.templateBody, null, 2);
  };

  public handleChange = (rawTemplateBody: string, templateBody: any): void => {
    this.command.templateBody = templateBody;
    this.templateBody = templateBody;
    this.rawTemplateBody = rawTemplateBody;
    this.$scope.$applyAsync();
  };
}

const cloudFormationTemplateEntryComponent: IComponentOptions = {
  bindings: { command: '<', templateBody: '<' },
  controller: CloudFormationTemplateController,
  controllerAs: 'ctrl',
  template: `
    <json-editor
      value="ctrl.rawTemplateBody"
      on-change="ctrl.handleChange"
    ></json-editor>`,
};

export const CLOUDFORMATION_TEMPLATE_ENTRY = 'spinnaker.tencentcloud.cloudformation.entry.component';
module(CLOUDFORMATION_TEMPLATE_ENTRY, []).component(
  'cloudFormationTemplateEntry',
  cloudFormationTemplateEntryComponent,
);
