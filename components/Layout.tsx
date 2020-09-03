import Head from 'next/head';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <>
      <Head>
        <title>Playable</title>
        <meta charSet="utf-8" />
        <meta property="og:title" content="Playable" />
        <meta
          property="og:description"
          content="A player that just plays the albums in your Spotify library"
        />
      </Head>

      {children}
    </>
  );
}
