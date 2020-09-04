import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import { accountRepository } from '../../repositories/account';
import { Account } from '../../interfaces/account';
import { Repository } from '../../interfaces/repository';
import { refreshToken } from '../../utils/handler';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session) {
    return res.json({ token: null });
  }

  const username = session.user.name;
  const accounts: Repository<Account> = accountRepository();
  const account: Account | null = await accounts.get(username);

  if (!account) {
    return res.json({ token: null });
  }

  const accessToken = await refreshToken(account);

  if (!accessToken) {
    return res.json({ token: null });
  }

  account.accessToken = accessToken;
  accounts.set(username, account);

  return res.json({ token: accessToken });
};

export default handler;
