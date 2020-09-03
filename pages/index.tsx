import { NextApiRequest, NextApiResponse } from 'next';
import { useRouter } from 'next/router';
import { getSession, signOut, useSession } from 'next-auth/client';
import AlbumList from '../components/AlbumList';
import styled from 'styled-components';

const Menu = styled.div`
  bottom: 1em;
  right: 1em;
  background: #fff;
  padding: 0.3em;
  position: fixed;
  z-index: 1;
`;

export default function Page() {
  const [session, loading] = useSession();
  const router = useRouter();

  if (!loading && !session) {
    router.push('/api/auth/signin');
  }

  return (
    <>
      {!loading && session && (
        <>
          <Menu>
            Signed in as {session.user.name}{' '}
            <button onClick={() => signOut({})}>Sign out</button>
          </Menu>
          <div>
            <AlbumList />
          </div>
        </>
      )}
    </>
  );
}
