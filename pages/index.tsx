import Link from 'next/link';
import { NextApiRequest } from 'next';
import { getSession, signOut, useSession } from 'next-auth/client';
import AlbumList from '../components/AlbumList';
import { accountRepository } from '../repositories/redis';
import { Account } from '../interfaces/account';
import { Repository } from '../interfaces/repository';

interface Props {
  accessToken?: string;
}

export default function Page(props: Props) {
  const [session] = useSession();

  return (
    <>
      {(!session || !props.accessToken) && (
        <>
          <Link href="/api/auth/signin">
            <a>Sign in</a>
          </Link>
        </>
      )}
      {session && props.accessToken && (
        <>
          <div>
            Signed in as {session.user.name}{' '}
            <button onClick={() => signOut({})}>Sign out</button>
          </div>
          <div>
            <AlbumList accessToken={props.accessToken} />
          </div>
        </>
      )}
    </>
  );
}

export async function getServerSideProps(context: { req: NextApiRequest }) {
  const session = await getSession(context);

  if (!session) {
    return { props: {} };
  }

  const username = session.user.name;
  const accounts: Repository<Account> = accountRepository();
  const account: Account | null = await accounts.get(username);

  if (!account) {
    return { props: {} };
  }

  return {
    props: { accessToken: account.accessToken }, // will be passed to the page component as props
  };
}
