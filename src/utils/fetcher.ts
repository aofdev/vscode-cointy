import { request } from "gaxios";

export default async function fetcher(url: string): Promise<any> {
  try {
    const res = await request({ url });
    if (res.status === 200 && res?.data) {
      return res.data;
    }
  } catch (err) {
    throw new Error(`Error function Fetcher: ${err}`);
  }
}
