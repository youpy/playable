import { Album } from '../interfaces/album';
import AlbumDetail from './AlbumDetail';
import React, { useState, useEffect, useReducer } from 'react';
import { signOut } from 'next-auth/client';
import styled from 'styled-components';
import { useSpotifyWebPlaybackSdk } from 'use-spotify-web-playback-sdk';
import { initialState, reducer } from '../reducer';
import { AlbumService } from '../services/album';

const AlbumListWrapper = styled.div`
  margin: 0.4em 0 0;
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
`;

const AlbumList = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [[data, page, total], setCursor] = useState<[Album[], number, number]>([
    [],
    0,
    0,
  ]);
  const { player, deviceId, isReady } = useSpotifyWebPlaybackSdk({
    name: 'Playable',
    accountError: (e: { message: string }) =>
      dispatch({ type: 'ERROR', payload: { message: e.message } }),
    getOAuthToken: async () => {
      const res = await fetch('/api/token');
      const json = await res.json();

      if (json.token === null) {
        // sign out if the token could not be retrieved
        return signOut({});
      }

      return json.token;
    },
    onPlayerStateChanged: (playerState) => {
      if (playerState && playerState.paused) {
        dispatch({ type: 'DESELECT' });
      }
    },
  });

  useEffect(() => {
    if (isReady) {
      player.connect();
    }

    const handleScroll = () => {
      const lastAlbumLoaded = document.querySelector(
        '.album-list > .album:last-child'
      );
      if (lastAlbumLoaded) {
        const rect = lastAlbumLoaded.getBoundingClientRect();
        const lastAlbumLoadedOffset = rect.top + rect.width;
        const pageOffset = window.pageYOffset + window.innerHeight;
        if (pageOffset > lastAlbumLoadedOffset) {
          if (page * 50 < total) {
            fn();
            window.removeEventListener('scroll', handleScroll);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    const fn = async () => {
      if (total < page * 50) {
        return;
      }

      try {
        const result = await new AlbumService().get({ page });

        setCursor([data.concat(result.albums), page + 1, result.total]);
      } catch (e) {
        // if the album could not be retrieved, the authentication token may have expired, so sign out.
        signOut({});
      }
    };

    if (page === 0) {
      fn();
    }

    if (page === 1) {
      handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [total, page, data, isReady]);

  return (
    <>
      {state.error && <div>{state.error}</div>}
      {!state.error && (
        <AlbumListWrapper className="album-list">
          {data.map((album: Album) => (
            <AlbumDetail
              key={album.uri}
              album={album}
              deviceId={deviceId!}
              active={state.album?.uri === album.uri}
              dispatch={dispatch}
              state={state}
            />
          ))}
        </AlbumListWrapper>
      )}
    </>
  );
};

export default AlbumList;
