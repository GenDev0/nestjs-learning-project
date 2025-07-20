import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class RemoveUndefinedPipe implements PipeTransform {
  transform(value: any): any {
    if (Array.isArray(value)) {
      return value.filter((item) => item !== undefined);
    } else if (typeof value === 'object' && value !== null) {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).filter(
          (entry) => entry[1] !== undefined,
        ),
      );
    }
    return value;
  }
}
