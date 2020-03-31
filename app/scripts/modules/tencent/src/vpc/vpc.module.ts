import { module } from 'angular';
import { name as VPCTAG_DIRECTIVE } from './vpcTag.directive';

export const VPC_MODULE = 'spinnaker.tencent.vpc';
module(VPC_MODULE, [VPCTAG_DIRECTIVE]);
