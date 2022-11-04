import { FC } from 'react'
import { APP_NAME } from '@/lib/consts'
import ConnectWallet from '@/components/ConnectWallet'
import { BookOpenIcon, CodeIcon, ShareIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import { useRouter } from "next/router"

interface Props {
  children: React.ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  const router = useRouter()

	return (
    <>
      <Head>
        <title>Tetu.Community</title>
      </Head>

      <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 py-4 pt-8">
        <div className="absolute top-6 right-6">
          <ConnectWallet />
        </div>

        <div className="flex place-content-center">
          <div className="w-16 h-16 relative"><Image alt="tetu logo" src="/images/tetu.png" layout="fill" /></div>
          <h1 className="text-2xl pl-2 pt-4">Tetu.Community</h1>
        </div>

        <ul className="flex place-content-center pt-4 pb-2">
          <li className={`px-4 ${router.pathname == "/" ? "active" : ""}`}><Link href="/">Overview</Link></li>
          <li className={`px-4 ${router.pathname == "/tetu-bal" ? "active" : ""}`}><Link href="/tetu-bal">TetuBAL</Link></li>
          <li className={`px-4 ${router.pathname == "/tetu-qi" ? "active" : ""}`}><Link href="/tetu-qi">TetuQI</Link></li>
          <li className={`px-4 ${router.pathname == "/more" ? "active" : ""}`}><Link href="/more">More</Link></li>
        </ul>

        {children}
      </div>
    </>
	)
}

export default Layout
