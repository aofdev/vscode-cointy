import { request } from "gaxios";

export default async function fetcher(payload: {
  url: string;
  headers?: any;
}): Promise<any> {
  try {
    const res = await request(payload);
    if (res.status === 200 && res?.data) {
      return res.data;
    }
  } catch (err) {
    throw new Error(`Error function Fetcher: ${err}`);
  }
}
