import { ClientSession, MongoClient } from 'mongodb';

export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
  mongoClient: MongoClient,
  session?: ClientSession,
): Promise<T> {
  // Session takes precendence over mongoClient
  return session === undefined
    ? await withNewSessionTransaction(fn, mongoClient)
    : await withExistingSessionTransaction(fn, session);
}

async function withExistingSessionTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
  session: ClientSession,
): Promise<T> {
  // Session already in transaction, program will assume it's already wrapped in session.withTransaction
  if (session.inTransaction()) {
    console.warn(
      "Session already in transaction, program will assume it's already wrapped in session.withTransaction",
    );
    return fn(session);
  }

  try {
    let result: T;
    await session.withTransaction(async () => (result = await fn(session)));
    return result;
  } catch (error) {
    console.log('Transaction aborted.');
    throw error;
  } finally {
    await session.endSession({});
  }
}

async function withNewSessionTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
  mongoClient: MongoClient,
): Promise<T> {
  let result: T;

  await mongoClient.withSession(
    async (session: ClientSession) =>
      await session.withTransaction(async () => (result = await fn(session))),
  );

  return result;
}
