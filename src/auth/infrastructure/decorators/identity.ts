import {
  createParamDecorator,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { UUID } from '../../../common/domain';
import { throwCustomException } from '../../../common/error-handling';
import { Host } from '../../../host/entity/Host';
import { Token } from '../../entity/Token';

import { IdentifiedRequest, Identity, IdentityType } from '../types';

function identityDecoratorFactory<TIdentity>(identityType: IdentityType) {
  return function(ctx: ExecutionContext): TIdentity {
    const {
      identity,
    }: IdentifiedRequest<Identity> = ctx.switchToHttp().getRequest();

    if (!identity) {
      throwCustomException(
        'No identity provided',
        undefined,
        HttpStatus.UNAUTHORIZED,
      )();
    }

    if (identity.type !== identityType) {
      throwCustomException(
        'Invalid entity type',
        undefined,
        HttpStatus.UNAUTHORIZED,
      )();
    }

    return (identity.entity as unknown) as TIdentity;
  };
}

function hostIdentityDecoratorFactory(verified: boolean, errorMessage: string) {
  return function(ctx: ExecutionContext): Host {
    const host: Host = identityDecoratorFactory<Host>(IdentityType.Host)(ctx);

    if (host.verified !== verified) {
      // TODO(NOW)(IMPORTANT): Better typing/error status for front-end to know that host needs to be verified
      throwCustomException(errorMessage, undefined, HttpStatus.FORBIDDEN)();
    }

    return host;
  };
}

// TODO(NOW): Anonymous identity

export const VerificationTokenIdentity = createParamDecorator<any, any, Token>(
  identityDecoratorFactory<Token>(IdentityType.VerificationToken),
);

export const CustomerIdentity = createParamDecorator<any, any, UUID>(
  identityDecoratorFactory<UUID>(IdentityType.Customer),
);

export const HostIdentity = createParamDecorator<any, any, Host>(
  identityDecoratorFactory<Host>(IdentityType.Host),
);

export const VerifiedHostIdentity = createParamDecorator<any, any, Host>(
  hostIdentityDecoratorFactory(true, 'Host is not verified'),
);

export const UnverifiedHostIdentity = createParamDecorator<any, any, Host>(
  hostIdentityDecoratorFactory(false, 'Only available to unverified hosts'),
);
