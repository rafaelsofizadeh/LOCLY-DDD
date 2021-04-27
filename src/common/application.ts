import { ClientSession, MongoClient } from 'mongodb';
import { Exception } from './error-handling';

export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
  mongoClient: MongoClient,
  session?: ClientSession,
): Promise<T> {
  const wrappedFn = (session: ClientSession) =>
    abortTransactionOnNonMongoException(session, fn);
  // Session takes precendence over mongoClient
  return session === undefined
    ? await withNewSessionTransaction(mongoClient, wrappedFn)
    : await withExistingSessionTransaction(session, wrappedFn);
}

async function withExistingSessionTransaction<T>(
  session: ClientSession,
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  // Session already in transaction, program will assume it's already wrapped in session.withTransaction
  if (session.inTransaction()) {
    console.warn(
      "Session already in transaction, program will assume it's already wrapped in session.withTransaction",
    );
    return fn(session);
  }

  let result: T;
  await session.withTransaction(async () => (result = await fn(session)));
  return result;
}

async function withNewSessionTransaction<T>(
  mongoClient: MongoClient,
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  let result: T;

  await mongoClient.withSession(
    async (session: ClientSession) =>
      await session.withTransaction(
        async (transactionalSession: ClientSession) =>
          (result = await fn(transactionalSession)),
      ),
  );

  return result;
}

async function abortTransactionOnNonMongoException<T>(
  session: ClientSession,
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  // Test if session has a transaction initialized (to abort that transaction)
  if (!session.inTransaction()) {
    throw new Error(
      "Can't abort transaction as session isn't in transaction state",
    );
  }

  try {
    return await fn(session);
  } catch (exceptionOrMongoError) {
    if (exceptionOrMongoError instanceof Exception) {
      await session.abortTransaction();
      console.log('Transaction aborted');
    }

    throw exceptionOrMongoError;
  }
}
