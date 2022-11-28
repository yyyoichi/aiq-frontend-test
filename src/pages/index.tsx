import Head from 'next/head';
import { useEffect, useState } from 'react';
import fetcher from 'src/lib/fetcher';
import styles from '../styles/Home.module.css';
type Pref = {
  prefCode: number;
  prefName: string;
};
type JSONPref = {
  message: string | null;
  result: Pref[];
};
type PopulationCompo = { name: string; value: number[] };
type JSONPopCmp = {
  message: string | null;
  result: {
    boundaryYear: number;
    data: { label: string; data: { year: number; value: number }[] }[];
  };
};
export default function Home() {
  const [pref, setPref] = useState<Pref[]>([]);
  useEffect(() => {
    // 1．RESAS(地域経済分析システム) APIの「都道府県一覧」APIから取得する
    const url = 'https://opendata.resas-portal.go.jp/api/v1/prefectures';
    fetcher<JSONPref>(url)
      .then((res) => setPref(res.result))
      .catch((e) => console.error(e));
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>AIQ codeing test</title>
        <meta
          name='description'
          content='都道府県別の総人口推移グラフを表示するSPA(Single Page Application)を構築せよ'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <h1>都道府県別の総人口推移グラフを表示するSPA(Single Page Application)を構築せよ</h1>
      <div>
        {
          // 2．APIレスポンスから都道府県一覧のチェックボックスを動的に生成する
          pref.map((x, i) => {
            return (
              <label key={i}>
                <input type='checkbox' value={x.prefCode} />
                {x.prefName}
              </label>
            );
          })
        }
      </div>
    </div>
  );
}
