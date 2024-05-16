import { Injectable, PipeTransform } from '@nestjs/common';
import { isGreaterThan, isLessThan } from '@libs/helper/bignumber';
import { isUndefined } from '@libs/helper/type';
import { PaginationRequest } from './pagination.request';

class RequestWithPagination extends PaginationRequest {
  [key: string]: any;
}

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(value: Record<string, any>): RequestWithPagination {
    const result = new RequestWithPagination();
    Object.assign(result, value);

    if (!isUndefined(value?.page)) {
      result.page = Number(value?.page);
      // page.Min = 1
      if (isLessThan(result.page, 1)) {
        result.page = Number(1);
      }
    }

    if (!isUndefined(value?.limit)) {
      result.limit = Number(value?.limit);

      // limit.Min = 1 | limit.max = 1000
      if (isLessThan(result.limit, 1)) {
        result.limit = Number(1);
      } else if (isGreaterThan(result.limit, 1000)) {
        result.limit = Number(1000);
      }
    }

    if (!isUndefined(result.page) && !isUndefined(result.limit)) {
      result.skipItems = (result.page - 1) * result.limit;
    }

    return result;
  }
}
