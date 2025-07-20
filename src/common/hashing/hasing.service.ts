import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  /**
   * Hashes a value using bcrypt.
   * @param value The value to hash.
   * @returns The hashed value.
   */
  hashValue(value: string): string {
    return bcrypt.hashSync(value, 12);
  }

  /**
   * Compares a plain text password with a hashed value.
   * @param plainValue The plain text value.
   * @param hashedValue The hashed value to compare against.
   * @returns True if the values match, false otherwise.
   */
  compareValue(plainValue: string, hashedValue: string): boolean {
    return bcrypt.compareSync(plainValue, hashedValue);
  }
}
