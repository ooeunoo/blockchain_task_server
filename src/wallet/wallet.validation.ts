import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidWalletAddress', async: false })
@Injectable()
export class IsValidWalletAddress implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    try {
      ethers.utils.getAddress(value);
      return true;
    } catch (e) {
      return false;
    }
  }
  defaultMessage(validationArguments: ValidationArguments): string {
    return `${validationArguments.property} must be valid address`;
  }
}
