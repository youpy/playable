import { Album } from './interfaces/album';

export interface State {
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

export const initialState: State = {
  activeAlbum: null,
  playerStatus: 'paused',
};

export const reducer = (_state: State, action: Action): State => {
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
