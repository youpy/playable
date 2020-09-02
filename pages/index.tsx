import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, signOut, useSession } from 'next-auth/client';
import AlbumList from '../components/AlbumList';
import { accountRepository } from '../repositories/redis';
import { Account } from '../interfaces/account';
import { Repository } from '../interfaces/repository';
import { refreshToken } from '../utils/handler';
import styled from 'styled-components';

interface Props {
  accessToken?: string;
}

const Menu = styled.div`
  bottom: 1em;
  right: 1em;
  background: #fff;
  padding: 0.3em;
  position: fixed;
  z-index: 1;
`;

export default function Page(props: Props) {
  const [session] = useSession();

  return (
    <>
      {session && props.accessToken && (
        <>
          <Menu>
            Signed in as {session.user.name}{' '}
            <button onClick={() => signOut({})}>Sign out</button>
          </Menu>
          <div>
            <AlbumList accessToken={props.accessToken} />
          </div>
        </>
      )}
    </>
  );
}

const redirectToSignIn = (res: NextApiResponse) => {
  res.writeHead(302, { Location: '/api/auth/signin' });
  res.end();

  return { props: {} };
};

export async function getServerSideProps(context: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const session = await getSession(context);

  if (!session) {
    return redirectToSignIn(context.res);
  }

  const username = session.user.name;
  const accounts: Repository<Account> = accountRepository();
  const account: Account | null = await accounts.get(username);

  if (!account) {
    return redirectToSignIn(context.res);
  }

  const accessToken = await refreshToken(account);

  if (!accessToken) {
    return redirectToSignIn(context.res);
  }

  account.accessToken = accessToken;
  accounts.set(username, account);

  return {
    props: { accessToken }, // will be passed to the page component as props
  };
}
