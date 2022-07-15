import Head from 'next/head'
import { AppProps } from 'next/app'
import '../styles/index.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Draw With Frens</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
