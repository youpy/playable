import { Account } from '../interfaces/account';
import redis from 'redis';

export class AccountRepository {
  client: redis.RedisClient;

  constructor(redisURL: string) {
    this.client = redis.createClient(redisURL);
  }

  get(id: string): Promise<Account | null> {
    return new Promise((res, _rej) => {
      this.client.get(id, function (_err, reply) {
        if (reply === null) {
          res(null);

          return;
        }

        const data = JSON.parse(reply);

        res({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      });
    });
  }

  set(id: string, account: Account): Promise<void> {
    const value = JSON.stringify(account);

    this.client.set(id, value);

    return Promise.resolve();
  }
}

let instance: AccountRepository;

export const accountRepository = () => {
  if (!instance) {
    instance = new AccountRepository(
      process.env.REDIS_URL || 'redis://localhost'
    );
  }

  return instance;
};
