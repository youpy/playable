import { Album } from './interfaces/album';

export interface State {
  album: Album | null;
  error?: string;
  playerStatus: 'playing' | 'paused';
}

export type Action =
  | {
      type: 'SELECT';
      payload: {
        album: Album;
      };
    }
  | {
      type: 'DESELECT';
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
  album: null,
  playerStatus: 'paused',
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SELECT':
      return {
        album: action.payload.album,
        playerStatus: 'playing',
      };
    case 'DESELECT':
      return {
        album: null,
        playerStatus: 'paused',
      };
    case 'PAUSE':
      return { ...state, ...{ playerStatus: 'paused' } };
    case 'ERROR':
      return {
        album: null,
        playerStatus: 'paused',
        error: action.payload.message,
      };
    default:
      throw new Error();
  }
};
