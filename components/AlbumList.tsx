import { Album, Artist, Tracks } from '../interfaces/album';
import AlbumDetail from './AlbumDetail';
import React, { useState, useEffect, useReducer } from 'react';
import styled from 'styled-components';
import { useSpotifyWebPlaybackSdk } from 'use-spotify-web-playback-sdk';

interface Props {
  accessToken: string;
}

interface Image {
  url: string;
}

interface Item {
  album: {
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
    addedAt,
    imageUrl,
    name,
    artist,
    externalUrl,
    tracks: item.album.tracks,
  };
};

interface State {
  activeAlbum: Album | null;
  error?: string;
  playerStatus: 'playing' | 'paused';
}

export type Action =
  | {
      type: 'PLAY';
      payload: {
        album: Album;
      };
    }
  | {
      type: 'PAUSE';
    }
  | {
      type: 'ERROR';
      payload: {
        message: string;
      };
    };
const initialState: State = { activeAlbum: null, playerStatus: 'paused' };
const reducer = (_state: State, action: Action): State => {
  switch (action.type) {
    case 'PLAY':
      return { activeAlbum: action.payload.album, playerStatus: 'playing' };
    case 'PAUSE':
      return { activeAlbum: null, playerStatus: 'paused' };
    case 'ERROR':
      return {
        activeAlbum: null,
        playerStatus: 'paused',
        error: action.payload.message,
      };
    default:
      throw new Error();
  }
};

const AlbumListWrapper = styled.div`
  margin: 0.4em 0 0;
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
`;

const AlbumList = (props: Props) => {
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
    getOAuthToken: () => Promise.resolve(props.accessToken),
    onPlayerStateChanged: (playerState) => {
      if (playerState && playerState.paused) {
        dispatch({ type: 'PAUSE' });
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

      setCursor([data.concat(json.items), page + 1, json.total]);
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
                state.activeAlbum?.externalUrl ===
                item.album.external_urls.spotify
              }
              dispatch={dispatch}
            />
          ))}
        </AlbumListWrapper>
      )}
    </>
  );
};

export default AlbumList;
