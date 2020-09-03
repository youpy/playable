import { Album, Artist, Tracks } from '../interfaces/album';
import AlbumDetail from './AlbumDetail';
import React, { useState, useEffect, useReducer } from 'react';
import { signOut } from 'next-auth/client';
import styled from 'styled-components';
import { useSpotifyWebPlaybackSdk } from 'use-spotify-web-playback-sdk';
import { initialState, reducer } from '../reducer';

interface Image {
  url: string;
}

interface Item {
  album: {
    uri: string;
    external_ids: {
      upc: string;
    };
    added_at: string;
    images: Image[];
    name: string;
    artists: Artist[];
    external_urls: {
      spotify: string;
    };
    tracks: Tracks;
  };
}

const itemToAlbum = (item: Item): Album => {
  const albumItem = item.album;
  const addedAt = Date.parse(albumItem.added_at);
  const imageUrl = albumItem.images[1].url;
  const name = albumItem.name;
  const artist = albumItem.artists[0];
  const externalUrl = albumItem.external_urls.spotify;

  return {
    uri: albumItem.uri,
    addedAt,
    imageUrl,
    name,
    artist,
    externalUrl,
    tracks: item.album.tracks,
  };
};

const AlbumListWrapper = styled.div`
  margin: 0.4em 0 0;
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
`;

const AlbumList = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [[data, page, total], setCursor] = useState<[Item[], number, number]>([
    [],
    0,
    0,
  ]);
  const { player, deviceId, isReady } = useSpotifyWebPlaybackSdk({
    name: 'my spotify player',
    accountError: (e: { message: string }) =>
      dispatch({ type: 'ERROR', payload: { message: e.message } }),
    getOAuthToken: async () => {
      const res = await fetch('/api/token');
      const json = await res.json();

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

      const res = await fetch(`/api/albums?page=${page}`);
      const json = await res.json();

      if (json.items) {
        setCursor([data.concat(json.items), page + 1, json.total]);
      } else {
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
          {data.map((item: Item) => (
            <AlbumDetail
              key={item.album.external_urls.spotify}
              album={itemToAlbum(item)}
              deviceId={deviceId!}
              active={
                state.album?.externalUrl === item.album.external_urls.spotify
              }
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
