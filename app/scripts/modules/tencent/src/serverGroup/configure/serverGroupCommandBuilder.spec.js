'use strict';

import { AccountService, SubnetReader } from '@spinnaker/core';

import { TENCENTCLOUDProviderSettings } from 'tencent/tencentCloud.settings';

describe('tencentCloudServerGroupCommandBuilder', function() {
  const AccountServiceFixture = require('./AccountServiceFixtures');

  beforeEach(window.module(require('./serverGroupCommandBuilder.service').name));

  beforeEach(
    window.inject(function(tencentCloudServerGroupCommandBuilder, $q, $rootScope, instanceTypeService) {
      this.tencentCloudServerGroupCommandBuilder = tencentCloudServerGroupCommandBuilder;
      this.$scope = $rootScope;
      this.instanceTypeService = instanceTypeService;
      this.$q = $q;
      spyOn(AccountService, 'getPreferredZonesByAccount').and.returnValue(
        $q.when(AccountServiceFixture.preferredZonesByAccount),
      );
      spyOn(AccountService, 'getCredentialsKeyedByAccount').and.returnValue(
        $q.when(AccountServiceFixture.credentialsKeyedByAccount),
      );
      spyOn(SubnetReader, 'listSubnets').and.returnValue($q.when([]));
      spyOn(AccountService, 'getAvailabilityZonesForAccountAndRegion').and.returnValue(this.$q.when(['a', 'b', 'c']));
    }),
  );

  afterEach(TENCENTCLOUDProviderSettings.resetToOriginal);

  describe('buildNewServerGroupCommand', function() {
    it('initializes to default values, setting usePreferredZone flag to true', function() {
      var command = null;
      TENCENTCLOUDProviderSettings.defaults.iamRole = '{{application}}IAMRole';
      this.tencentCloudServerGroupCommandBuilder
        .buildNewServerGroupCommand({ name: 'appo', defaultCredentials: {}, defaultRegions: {} }, 'tencent')
        .then(function(result) {
          command = result;
        });

      this.$scope.$digest();

      expect(command.viewState.usePreferredZones).toBe(true);
      expect(command.availabilityZones).toEqual(['a', 'b', 'c']);
      expect(command.iamRole).toBe('appoIAMRole');
    });
  });

  describe('buildServerGroupCommandFromExisting', function() {
    it('sets usePreferredZones flag based on initial value', function() {
      spyOn(this.instanceTypeService, 'getCategoryForInstanceType').and.returnValue(this.$q.when('custom'));
      var baseServerGroup = {
        account: 'prod',
        region: 'us-west-1',
        asg: {
          availabilityZones: ['g', 'h', 'i'],
          vpczoneIdentifier: '',
        },
      };
      var command = null;

      this.tencentCloudServerGroupCommandBuilder
        .buildServerGroupCommandFromExisting({ name: 'appo' }, baseServerGroup)
        .then(function(result) {
          command = result;
        });

      this.$scope.$digest();

      expect(command.viewState.usePreferredZones).toBe(true);
      expect(command.availabilityZones).toEqual(['g', 'h', 'i']);

      baseServerGroup.asg.availabilityZones = ['g'];

      this.tencentCloudServerGroupCommandBuilder
        .buildServerGroupCommandFromExisting({ name: 'appo' }, baseServerGroup)
        .then(function(result) {
          command = result;
        });

      this.$scope.$digest();

      expect(command.viewState.usePreferredZones).toBe(false);
      expect(command.availabilityZones).toEqual(['g']);
    });

    it('sets profile and instance type if available', function() {
      spyOn(this.instanceTypeService, 'getCategoryForInstanceType').and.returnValue(this.$q.when('selectedProfile'));

      var baseServerGroup = {
        account: 'prod',
        region: 'us-west-1',
        asg: {
          availabilityZones: ['g', 'h', 'i'],
          vpczoneIdentifier: '',
        },
        launchConfig: {
          instanceType: 'something-custom',
          instanceMonitoring: {},
          securityGroups: [],
        },
      };
      var command = null;

      this.tencentCloudServerGroupCommandBuilder
        .buildServerGroupCommandFromExisting({ name: 'appo' }, baseServerGroup)
        .then(function(result) {
          command = result;
        });

      this.$scope.$digest();

      expect(command.viewState.instanceProfile).toBe('selectedProfile');
      expect(command.instanceType).toBe('something-custom');
    });

    it('copies suspended processes unless the mode is "editPipeline"', function() {
      spyOn(this.instanceTypeService, 'getCategoryForInstanceType').and.returnValue(this.$q.when('selectedProfile'));

      var baseServerGroup = {
        account: 'prod',
        region: 'us-west-1',
        asg: {
          availabilityZones: ['g', 'h', 'i'],
          vpczoneIdentifier: '',
          suspendedProcesses: [{ processName: 'x' }, { processName: 'a' }],
        },
        launchConfig: {
          instanceType: 'something-custom',
          instanceMonitoring: {},
          securityGroups: [],
        },
      };
      var command = null;

      this.tencentCloudServerGroupCommandBuilder
        .buildServerGroupCommandFromExisting({ name: 'appo' }, baseServerGroup)
        .then(result => (command = result));

      this.$scope.$digest();

      expect(command.suspendedProcesses).toEqual(['x', 'a']);

      this.tencentCloudServerGroupCommandBuilder
        .buildServerGroupCommandFromExisting({ name: 'appo' }, baseServerGroup, 'editPipeline')
        .then(result => (command = result));

      this.$scope.$digest();

      expect(command.suspendedProcesses).toEqual([]);
    });

    it('copies tags not in the reserved list:', function() {
      spyOn(this.instanceTypeService, 'getCategoryForInstanceType').and.returnValue(this.$q.when('selectedProfile'));

      const baseServerGroup = {
        account: 'prod',
        region: 'us-west-1',
        tags: null,
        asg: {
          availabilityZones: ['g', 'h', 'i'],
          vpczoneIdentifier: '',
          tags: [
            {
              key: 'some-key',
              propagateAtLaunch: true,
              resourceId: 'some-resource-id',
              resourceType: 'auto-scaling-group',
              value: 'some-value',
            },
            {
              key: 'spinnaker:application',
              value: 'n/a',
            },
          ],
        },
        launchConfig: {
          instanceType: 'something-custom',
          instanceMonitoring: {},
          securityGroups: [],
        },
      };
      let command = null;

      this.tencentCloudServerGroupCommandBuilder
        .buildServerGroupCommandFromExisting({ name: 'appo' }, baseServerGroup)
        .then(result => (command = result));

      this.$scope.$digest();

      expect(command.tags).toEqual({ 'some-key': 'some-value' });
    });
  });
});
