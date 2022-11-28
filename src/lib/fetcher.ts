const apikey = process.env.NEXT_PUBLIC_X_API_KEY || '';
if (!apikey) {
  console.error('Does not exists api-key ');
}
const fetcher = async <T>(url: string): Promise<T> => {
  const headers = new Headers();
  headers.set('X-API-KEY', apikey);
  const options: RequestInit = {
    method: 'GET',
    headers: headers,
  };
  const res = await fetch(url, options);
  if (res.status !== 200) {
    console.error('データ取得に失敗しました。');
  }
  return await res.json();
};
export default fetcher;
