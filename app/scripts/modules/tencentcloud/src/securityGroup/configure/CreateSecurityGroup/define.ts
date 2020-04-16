import { Application } from '@spinnaker/core';

export interface ICreateSecurityGroupProps {
  isNew: boolean;
  closeModal?(result?: any): void;
  dismissModal?(rejection?: any): void;
  application: Application;
}

export interface ISecurityGroupIngress {
  protocol: string;
  port: string | number;
  cidrBlock: string | number;
  action: string;
}
