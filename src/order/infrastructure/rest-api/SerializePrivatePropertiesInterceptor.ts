import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SerializePrivatePropertiesInterceptor<T>
  implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(object => {
        const shallowCopy = Object.assign(object);

        const result = Object.keys(shallowCopy).reduce((resultObject, key) => {
          if (key[0] === '_') {
            key = key.slice(1);
          }

          resultObject[key] = shallowCopy[key];

          return resultObject;
        }, {});

        return result;
      }),
    );
  }
}
