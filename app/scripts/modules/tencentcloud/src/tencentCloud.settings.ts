import { IProviderSettings, SETTINGS } from '@spinnaker/core';

export interface IClassicLaunchWhitelist {
  region: string;
  credentials: string;
}

export interface ITENCENTCLOUDProviderSettings extends IProviderSettings {
  defaults: {
    account?: string;
    region?: string;
    subnetType?: string;
    vpc?: string;
  };
  defaultSecurityGroups?: string[];
  loadBalancers?: {
    inferInternalFlagFromSubnet: boolean;
    certificateTypes?: string[];
  };
  useAmiBlockDeviceMappings?: boolean;
  classicLaunchLockout?: number;
  classicLaunchWhitelist?: IClassicLaunchWhitelist[];
  metrics?: {
    customNamespaces?: string[];
  };
  minRootVolumeSize?: number;
  disableSpotPricing?: boolean;
}

export const TENCENTCLOUDProviderSettings: ITENCENTCLOUDProviderSettings = (SETTINGS.providers
  .tencent as ITENCENTCLOUDProviderSettings) || {
  defaults: {},
};
if (TENCENTCLOUDProviderSettings) {
  TENCENTCLOUDProviderSettings.resetToOriginal = SETTINGS.resetProvider('tencentcloud');
}
