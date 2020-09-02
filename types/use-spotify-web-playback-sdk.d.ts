declare module 'use-spotify-web-playback-sdk' {
  interface Options {
    name: string;
    getOAuthToken: () => Promise<string>;
    accountError?: (e: any) => void;
    onReady?: (deviceId: string) => void;
    onPlayerStateChanged?: (state?: { paused: boolean }) => void;
  }

  interface SpotifyPlayer {
    connect: () => Promise<boolean>;
    pause: () => Promise<void>;
  }

  interface HookReturnValue {
    isReady: boolean;
    deviceId: string | null;
    connect: () => Promise<Boolean>;
    player: SpotifyPlayer;
    Script: React.FunctionComponent<{ children: React.ReactNode }>;
  }

  export function useSpotifyWebPlaybackSdk(options: Options): HookReturnValue;
}
