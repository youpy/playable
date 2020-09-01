import { Album } from '../interfaces/album';
import React from 'react';
import styled from 'styled-components';
import { Action } from './AlbumList';

interface Props {
  album: Album;
  deviceId: string;
  active: boolean;
  dispatch: React.Dispatch<Action>;
}

const AlbumDetailWrapper = styled.div`
  margin: 0.2em 0.2em 0 0;
  a {
    opacity: 0.25;
  }

  .active {
    opacity: 1;
  }
`;

const AlbumDetail = (props: Props): React.ReactElement => {
  const { album, deviceId, active, dispatch } = props;
  const onClick = async () => {
    const searchParams = new URLSearchParams();

    searchParams.set('deviceId', deviceId);
    album.tracks.items.forEach((item) =>
      searchParams.append('spotifyUris', item.uri)
    );

    await fetch(`/api/playback?${searchParams.toString()}`);
    dispatch({ type: 'PLAY', payload: { album: album } });
  };

  return (
    <AlbumDetailWrapper className="album">
      <a
        href={void 0}
        className={`${active ? 'active' : ''}`}
        onClick={onClick}
      >
        <img src={album.imageUrl} width="150" height="150" />
      </a>
    </AlbumDetailWrapper>
  );
};
export default AlbumDetail;
