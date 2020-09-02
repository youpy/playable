import { Album } from '../interfaces/album';
import React from 'react';
import styled from 'styled-components';
import { Action, State } from '../reducer';

interface Props {
  album: Album;
  deviceId: string;
  active: boolean;
  dispatch: React.Dispatch<Action>;
  state: State;
}

const AlbumDetailWrapper = styled.div`
  margin: 5px;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  a {
    display: flex;
    opacity: 0.25;
  }

  a:hover {
    opacity: 0.45;
  }

  a.active {
    opacity: 1;
  }
`;

const AlbumDetail = (props: Props): React.ReactElement => {
  const { album, deviceId, active, dispatch, state } = props;
  const onClick = async () => {
    const searchParams = new URLSearchParams();
    const playing =
      state.playerStatus === 'playing' && album.uri === state.album?.uri;

    searchParams.set('deviceId', deviceId);

    if (!playing) {
      searchParams.append('contextUri', album.uri);

      await fetch(`/api/playback?${searchParams.toString()}`);
      dispatch({ type: 'SELECT', payload: { album } });
    } else {
      await fetch(`/api/pause?${searchParams.toString()}`);
      dispatch({ type: 'DESELECT' });
    }
  };

  return (
    <AlbumDetailWrapper className="album">
      <a
        href={void 0}
        className={`${active ? 'active' : ''}`}
        onClick={onClick}
      >
        <img src={album.imageUrl} width="100%" height="100%" />
      </a>
    </AlbumDetailWrapper>
  );
};
export default AlbumDetail;
