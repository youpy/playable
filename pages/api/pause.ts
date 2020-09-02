import axios, { AxiosResponse } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { handleWithAccessToken } from '../../utils/handler';

const pause = async (
  accessToken: string,
  deviceId: string
): Promise<AxiosResponse> => {
  return await axios.put(
    `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { deviceId } = req.query;

  await handleWithAccessToken(
    async (accessToken) => {
      const res = await pause(accessToken, deviceId as string);
      return res.data;
    },
    req,
    res
  );
};

export default handler;
