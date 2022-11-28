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
type PopCmpGraph = {
  //横軸ラベル
  xAxisCtg: string[];
  series: PopulationCompo[];
};
/**
 * @type {{name}} 都道府県名
 * @type {{data}} 総人口
 */
type PopulationCompo = { name: string; data: number[] };
type PopCmpData = {
  year: number;
  value: number;
};
type JSONPopCmp = {
  message: string | null;
  result: {
    boundaryYear: number;
    data: { label: string; data: PopCmpData[] }[];
  };
};
export default function Home() {
  const [pref, setPref] = useState<Pref[]>([]);
  const [checkedPref, setCheckedPref] = useState<Pref[]>([]);
  const [dataset, setDataset] = useState<PopCmpGraph>({
    xAxisCtg: [],
    series: [],
  });
  useEffect(() => {
    // 1．RESAS(地域経済分析システム) APIの「都道府県一覧」APIから取得する
    const url = 'https://opendata.resas-portal.go.jp/api/v1/prefectures';
    fetcher<JSONPref>(url)
      .then((res) => setPref(res.result))
      .catch((e) => console.error(e));
  }, []);
  useEffect(() => {
    // 3. 都道府県にチェックを入れると、RESAS APIから選択された都道府県の「人口構成」を取得する

    let isChenged = false;
    // RESAS APIから選択されたそれぞれの都道府県の「人口構成」を取得する
    Promise.all(
      checkedPref.map(async (p) => {
        return {
          res: await getPopCompo(p.prefCode),
          name: p.prefName,
        };
      }),
    ).then((res) => {
      if (isChenged) {
        // すでにcheck変更済みのためスキップ
        return;
      }
      if (res.length === 0) {
        return setDataset({ xAxisCtg: [], series: [] });
      }
      // 横軸ラベル
      const xAxisCtg = res[0]['res']['year'].map((x) => String(x));
      // 各レスポンスの実測データの過不足はない想定のためエラーを省く。
      const series = res.map((d) => {
        const name = d['name'];
        const data = d['res']['value'];
        return { name, data };
      });
      setDataset({ xAxisCtg, series });
    });
    return () => {
      isChenged = true;
    };
  }, [checkedPref]);
  /**
   * 総人口（実測）をRESAS APIから取得する
   * @param code 取得する都道府県コード
   */
  const getPopCompo = async (code: Pref['prefCode']) => {
    const url = `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${code}`;
    const json = await fetcher<JSONPopCmp>(url);
    let data: PopCmpData[] = [];
    //総人口のデータを取得
    for (const rlt of json['result']['data']) {
      if (rlt['label'] === '総人口') {
        data = rlt['data'];
      }
    }
    // 返却型
    type Target = {
      year: number[];
      value: number[];
    };
    // 実測年度
    const boundaryYear = json['result']['boundaryYear'];
    return data
      .filter((pcd) => {
        // 実測年度以前のデータを対象とする（予測値は対象外）
        return pcd.year <= boundaryYear;
      })
      .sort((a, b) => a.year - b.year)
      .reduce(
        // 型を変形する
        (pv: Target, pcd) => {
          const year = [...pv['year'], pcd['year']];
          const value = [...pv['value'], pcd['value']];
          return { year, value };
        },
        // 初期値
        {
          year: [],
          value: [],
        },
      );
  };
  /**
   * チェックされた都道府県をcheckedPrefに追加・削除する
   * @param p クリックされた都道府県
   * @param isChecked
   */
  const handleChecked = (p: Pref, isChecked: boolean) => {
    if (isChecked) {
      setCheckedPref((cp) => {
        return [...cp, p];
      });
    } else {
      setCheckedPref((cp) => {
        return cp.filter((x) => x.prefCode !== p.prefCode);
      });
    }
  };
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
                <input
                  type='checkbox'
                  value={x.prefCode}
                  onChange={(e) => handleChecked(x, e.target.checked)}
                />
                {x.prefName}
              </label>
            );
          })
        }
      </div>
      <Graph dataset={dataset} />
    </div>
  );
}
function Graph({ dataset }: { dataset: PopCmpGraph }) {
  const options = {
    xAxis: {
      title: {
        text: '年度',
      },
      categories: dataset['xAxisCtg'],
    },
    yAxis: {
      title: {
        text: '人口数',
      },
    },
    series: dataset['series'],
  };
  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}
