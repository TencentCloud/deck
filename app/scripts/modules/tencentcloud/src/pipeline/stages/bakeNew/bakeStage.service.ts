import { API } from 'core/api/ApiService';

export class BakeStageService {
  public static getInstanceTypes() {
    return API.one('instanceTypes')
      .useCache()
      .get();
  }

  public static getSubnets(cloudProvider: string) {
    return API.one('subnets')
      .one(cloudProvider)
      .useCache()
      .get();
  }
}
