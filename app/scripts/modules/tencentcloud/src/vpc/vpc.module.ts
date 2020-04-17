import { module } from 'angular';
import { TENCENT_VPC_VPCTAG_DIRECTIVE } from './vpcTag.directive';

export const VPC_MODULE = 'spinnaker.tencentcloud.vpc';
module(VPC_MODULE, [TENCENT_VPC_VPCTAG_DIRECTIVE]);
