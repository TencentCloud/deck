import { IPromise } from 'angular';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';

import { AccountService, IServerGroupDetailsProps, ServerGroupReader } from '@spinnaker/core';

import { TencentcloudReactInjector } from 'tencentcloud/reactShims';
import { ITencentcloudLoadBalancer, ITencentcloudServerGroup, ITencentcloudServerGroupView } from 'tencentcloud/domain';

function extractServerGroupSummary(props: IServerGroupDetailsProps): IPromise<ITencentcloudServerGroup> {
  const { app, serverGroup } = props;
  return app.ready().then(() => {
    let summary: ITencentcloudServerGroup = app.serverGroups.data.find((toCheck: ITencentcloudServerGroup) => {
      return (
        toCheck.name === serverGroup.name &&
        toCheck.account === serverGroup.accountId &&
        toCheck.region === serverGroup.region
      );
    });
    if (!summary) {
      app.loadBalancers.data.some((loadBalancer: ITencentcloudLoadBalancer) => {
        if (loadBalancer.account === serverGroup.accountId && loadBalancer.region === serverGroup.region) {
          return loadBalancer.serverGroups.some(possibleServerGroup => {
            if (possibleServerGroup.name === serverGroup.name) {
              summary = possibleServerGroup;
              return true;
            }
            return false;
          });
        }
        return false;
      });
    }
    return summary;
  });
}

export function tencentcloudServerGroupDetailsGetter(
  props: IServerGroupDetailsProps,
  autoClose: () => void,
): Observable<ITencentcloudServerGroup> {
  const { app, serverGroup: serverGroupInfo } = props;
  return new Observable<ITencentcloudServerGroupView>(observer => {
    extractServerGroupSummary(props).then(summary => {
      ServerGroupReader.getServerGroup(
        app.name,
        serverGroupInfo.accountId,
        serverGroupInfo.region,
        serverGroupInfo.name,
      ).then((details: ITencentcloudServerGroup) => {
        // it's possible the summary was not found because the clusters are still loading
        Object.assign(details, summary, { account: serverGroupInfo.accountId });

        const serverGroup = TencentcloudReactInjector.tencentcloudServerGroupTransformer.normalizeServerGroupDetails(
          details,
        );

        AccountService.getAccountDetails(serverGroup.account).then(accountDetails => {
          serverGroup.accountDetails = accountDetails;
          observer.next(serverGroup);
        });

        if (!isEmpty(serverGroup)) {
          observer.next(serverGroup);
        } else {
          autoClose();
        }
      }, autoClose);
    }, autoClose);
  });
}
