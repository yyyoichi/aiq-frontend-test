import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
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
    </div>
  );
}
