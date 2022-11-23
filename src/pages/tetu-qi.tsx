import BigNumber from 'bignumber.js'
import { FC } from 'react'
import InfoBubble from '@/components/InfoBubble'
import useSWR from 'swr'
import fetcher from '@/lib/fetcher'

const LATEST_BRIBES_PER_1_PERCENT = BigNumber('500')
const LATEST_EQI_VOTING = BigNumber('62991200.451612905')
const LATEST_DXTETU_VOTING = BigNumber('69159059.13461539')

const TetuQi: FC = () => {
	const { data, error } = useSWR('/api/home', fetcher)

	let bribeAprForDxTetu
	if (data) {
		const dxTetuPrice = BigNumber(data.tetuPrice).times(data.xTetuPpfs)
		const howManyPercentWeControl = BigNumber(data.totalEQi).div(LATEST_EQI_VOTING)
		const howMuchBribeWeGetInTotal = LATEST_BRIBES_PER_1_PERCENT.times(howManyPercentWeControl).times(100)
		const howMuchBribeWeGetInTotalUsd = howMuchBribeWeGetInTotal.times(data.qiPrice)
		const totalDxTetuInUsd = BigNumber(LATEST_DXTETU_VOTING).times(dxTetuPrice)
		bribeAprForDxTetu = howMuchBribeWeGetInTotalUsd.times(26).div(totalDxTetuInUsd.toString()).times(100)
	}

	return (
		<div className="max-w-2xl mx-auto px-6 pt-4">
			<div className="text-justify">
				<p>
					TetuQi is the liquid-staking wrapper for the $QI token from{' '}
					<a href="https://mai.finance" target="_blank" rel="noreferrer">
						QiDao
					</a>
					. Currently, $dxTETU holders control the full voting rights for TetuQi.
				</p>
				<p className="pt-4">
					To receive bribes, vote in the Snapshot &ldquo;reflection votes&rdquo; on the{' '}
					<a href="https://snapshot.org/#/tetu.eth" target="_blank" rel="noreferrer">
						tetu.eth space
					</a>{' '}
					every two weeks. Most bribers have committed to calculating and airdropping incentives to $dxTetu
					holders.
				</p>
			</div>

			<div className="grid md:grid-cols-2 gap-4 pt-4">
				<InfoBubble loading={!data} title="Latest Bribes per 1%">
					<a href="https://ajb.github.io/qi-bribes/" target="_blank" rel="noreferrer">
						{LATEST_BRIBES_PER_1_PERCENT.toFixed(0)} QI
					</a>
				</InfoBubble>
				<InfoBubble loading={!data} title="Latest eQI voting">
					<a href="https://ajb.github.io/qi-bribes/" target="_blank" rel="noreferrer">
						{LATEST_EQI_VOTING.toFormat(0)} eQI
					</a>
				</InfoBubble>
				<InfoBubble loading={!data} title="Latest dxTETU voting">
					<a href="https://ajb.github.io/qi-bribes/" target="_blank" rel="noreferrer">
						{LATEST_DXTETU_VOTING.toFormat(0)} dxTETU
					</a>
				</InfoBubble>
				<InfoBubble loading={!data} title="eQI controlled by $dxTETU">
					{data ? BigNumber(data.totalEQi).toFormat(0) : ''}
				</InfoBubble>
				<InfoBubble loading={!data} title="Bribe APR for $dxTETU">
					{bribeAprForDxTetu ? bribeAprForDxTetu.toFixed(2) + ' %' : ''}
				</InfoBubble>
				<InfoBubble loading={!data} title="LP Staking APR for $tetuQi">
					{data ? BigNumber(data.tetuQiLpStakingApr).toFixed(2) + ' %' : ''}
				</InfoBubble>
			</div>
		</div>
	)
}

export default TetuQi
