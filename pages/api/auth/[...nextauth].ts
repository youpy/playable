import { NextApiResponse } from 'next';
import { NextApiRequest } from 'next';
import NextAuth, { InitOptions } from 'next-auth';
import Providers from 'next-auth/providers';
import { Account } from '../../../interfaces/account';
import { Repository } from '../../../interfaces/repository';
import { accountRepository } from '../../../repositories/account';

const options: InitOptions = {
  callbacks: {
    signIn: async (user, account: Account, _profile) => {
      const accounts: Repository<Account> = accountRepository();

      accounts.set(user.name, account);

      return Promise.resolve(true);
    },
  },
  providers: [
    Providers.Spotify({
      scope: 'user-library-read user-read-email user-read-private streaming',
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    }),
  ],
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, options);
