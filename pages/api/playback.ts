import axios, { AxiosResponse } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { handleWithAccessToken } from '../../utils/handle_with_access_token';

const play = async (
  deviceId: string,
  spotifyUris: string[],
  accessToken: string
): Promise<AxiosResponse> => {
  return await axios.put(
    `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
    {
      uris: spotifyUris,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { deviceId, spotifyUris } = req.query;

  await handleWithAccessToken(
    async (accessToken) => {
      const res = await play(
        deviceId as string,
        Array.isArray(spotifyUris) ? spotifyUris : [spotifyUris],
        accessToken
      );
      return res.data;
    },
    req,
    res
  );
};

export default handler;
