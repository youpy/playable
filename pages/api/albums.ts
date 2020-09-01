import axios, { AxiosResponse } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { handleWithAccessToken } from '../../utils/handle_with_access_token';

const getAlbums = async (
  page: number,
  accessToken: string
): Promise<AxiosResponse> => {
  return await axios.get(
    `https://api.spotify.com/v1/me/albums?limit=50&offset=${50 * page}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const page = parseInt((req.query.page as string) || '0');

  await handleWithAccessToken(
    async (accessToken) => {
      const res = await getAlbums(page, accessToken);
      return res.data;
    },
    req,
    res
  );
};

export default handler;
