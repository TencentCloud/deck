import { module } from 'angular';

import { SCALING_POLICY_MODULE } from './scalingPolicy/scalingPolicy.module';
import { TENCENT_SERVERGROUP_DETAILS_SECURITYGROUP_EDITSECURITYGROUPS_MODAL_CONTROLLER } from './securityGroup/editSecurityGroups.modal.controller';
import { TENCENT_SERVERGROUP_DETAILS_SCALINGPROCESSES_MODIFYSCALINGPROCESSES_CONTROLLER } from './scalingProcesses/modifyScalingProcesses.controller';
import { TENCENT_SERVERGROUP_DETAILS_SCHEDULEDACTION_EDITSCHEDULEDACTIONS_MODAL_CONTROLLER } from './scheduledAction/editScheduledActions.modal.controller';
import { TENCENT_SERVERGROUP_DETAILS_ADVANCEDSETTINGS_EDITASGADVANCEDSETTINGS_MODAL_CONTROLLER } from './advancedSettings/editAsgAdvancedSettings.modal.controller';
import { TENCENT_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER } from './rollback/rollbackServerGroup.controller';

export const SERVER_GROUP_DETAILS_MODULE = 'spinnaker.tencent.serverGroup.details';
module(SERVER_GROUP_DETAILS_MODULE, [
  SCALING_POLICY_MODULE,
  TENCENT_SERVERGROUP_DETAILS_SECURITYGROUP_EDITSECURITYGROUPS_MODAL_CONTROLLER,
  TENCENT_SERVERGROUP_DETAILS_SCALINGPROCESSES_MODIFYSCALINGPROCESSES_CONTROLLER,
  TENCENT_SERVERGROUP_DETAILS_SCHEDULEDACTION_EDITSCHEDULEDACTIONS_MODAL_CONTROLLER,
  TENCENT_SERVERGROUP_DETAILS_ADVANCEDSETTINGS_EDITASGADVANCEDSETTINGS_MODAL_CONTROLLER,
  TENCENT_SERVERGROUP_DETAILS_ROLLBACK_ROLLBACKSERVERGROUP_CONTROLLER,
]);
