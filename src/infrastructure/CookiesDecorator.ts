import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (prop: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return prop ? request.cookies?.[prop] : request.cookies;
  },
);
