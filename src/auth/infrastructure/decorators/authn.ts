import { SetMetadata } from '@nestjs/common';

export const AuthnStatusMetadataKey = 'AuthnStatus';

export enum AuthnStatus {
  Required = 'required',
  Optional = 'optional',
  Disallowed = 'disallowed',
  Skip = 'skip',
}

/**
 * 1. Handlers decorated with `AuthnOptional` may or may not have a full identity
 * passed to their `@Identity` parameter. If the user _is_ logged in, then the
 * handler receives a full identity: principal, credential, and scopes. If the
 * user is not logged in, then the handler receives an _anonymous_ identity.
 * The principal and credential are undefined; the scopes are whatever you've
 * set as the application's anonymous scopes.
 *
 * This differs from `AuthSkip` in that if you send _bad_ auth,
 * `AuthOptional` will fail and `AuthnSkip` will succeed
 *
 * Formally, the @Identity parameter should take as a type something that looks
 * like `Bill<TPrincipal, TCredential> | AnonymousBill`.
 *
 * 2. Please remember that, by default, `AuthnRequired` is not necessary. It is
 * implied on _all_ handlers. This just exists so that one can apply something
 * like `AuthnOptional` at the controller level but undo it at a lower level.
 *
 * You shouldn't do this regularly, but sometimes it makes your code easier to
 * read.
 *
 * 3. Handlers decorated with `AuthnSkip` completely skip Authn entirely
 * This is used for things that don't need any authentication checks at all
 *
 * This differs from `AuthOptional` in that if you send _bad_ auth,
 * `AuthOptional` will fail and `AuthnSkip` will succeed
 *
 * Note that contexts are not loaded since we short-circuit, so youyou have to
 * load all contexts manually in the Controller
 */
export const Authn = (status: AuthnStatus) =>
  SetMetadata(AuthnStatusMetadataKey, status);
