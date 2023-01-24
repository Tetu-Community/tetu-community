import BigNumber from 'bignumber.js'
import { FC } from 'react'
import InfoBubble from '@/components/InfoBubble'
import useSWR from 'swr'
import fetcher from '@/lib/fetcher'

const Home: FC = () => {
	const { data, error } = useSWR('/api/home', fetcher)

	return (
		<div className="max-w-2xl mx-auto px-6 pt-4">
			<div className="text-justify">
				Tetu.Community is designed to showcase the benefits of holding veTETU, the governance token of the{' '}
				<a href="https://app.tetu.io" target="_blank" rel="noreferrer">
					Tetu
				</a>{' '}
				platform.
			</div>

			<div className="grid md:grid-cols-2 gap-4 pt-4">
				<InfoBubble loading={!data} title="$TETU Circulating Supply">
					{data ? BigNumber(data.tetuCirculatingSupply).toFormat(0) : ''}
				</InfoBubble>
				<InfoBubble loading={!data} title="Total veTETU Power">
					{data ? BigNumber(data.dxTetuSupply).toFormat(0) : ''}
				</InfoBubble>
				<InfoBubble loading={!data} title="$TETU Price">
					${data ? BigNumber(data.tetuPrice).toFixed(4) : ''}
				</InfoBubble>
				<InfoBubble loading={!data} title="Market Cap">
					${data ? BigNumber(data.marketCap).toFormat(0) : ''}
				</InfoBubble>
				<InfoBubble loading={!data} title="$ veBAL Locked">
					${data ? BigNumber(data.veBalLockedUsd).toFormat(0) : ''}
				</InfoBubble>
				<InfoBubble loading={!data} title="$ QI Locked">
					${data ? BigNumber(data.eQiLockedUsd).toFormat(0) : ''}
				</InfoBubble>
			</div>
		</div>
	)
}

export default Home
