import axios from 'axios';
import { getSession } from 'next-auth/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { Account } from '../interfaces/account';
import { Repository } from '../interfaces/repository';
import { accountRepository } from '../repositories/redis';

export const refreshToken = async (
  account: Account
): Promise<string | undefined> => {
  const params = new URLSearchParams();

  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', account.refreshToken);

  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const buffer = Buffer.from([clientId, clientSecret].join(':'), 'ascii');

  const response = await axios.post(
    `https://accounts.spotify.com/api/token`,
    params,
    {
      headers: {
        Authorization: `Basic ${buffer.toString('base64')}`,
      },
    }
  );

  return response.data.access_token;
};

export const handleWithAccessToken = async (
  fn: (accessToken: string) => Promise<any>,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Forbidden' });
  }

  const username = session.user.name;
  const accounts: Repository<Account> = accountRepository();
  const account: Account | null = await accounts.get(username);

  if (account === null) {
    return res.json({});
  }

  try {
    const response = await fn(account.accessToken);

    res.json(response);
  } catch (e) {
    const headers = e.response?.headers;

    if (headers && (headers['www-authenticate'] || '').match(/expired/)) {
      try {
        const accessToken = await refreshToken(account);

        if (accessToken) {
          account.accessToken = accessToken;
          accounts.set(username, account);

          const response = await fn(account.accessToken);

          res.json(response);
        } else {
          return res.json({ error: 'could not refresh token' });
        }
      } catch (e) {
        return res.json({ error: e.message });
      }
    } else {
      res.json({ error: e.message });
    }
  }
};
