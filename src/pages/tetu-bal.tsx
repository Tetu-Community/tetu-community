import BigNumber from 'bignumber.js'
import { FC, useState } from 'react'
import InfoBubble from '@/components/InfoBubble'
import BribeModal from '@/components/BribeModal'
import FakeTable from '@/components/FakeTable'
import SortIndicator from '@/components/SortIndicator'
import useSWR from 'swr'
import fetcher from '@/lib/fetcher'
import {
	InboxArrowDownIcon,
	ArrowTopRightOnSquareIcon,
	BanknotesIcon,
	QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid'
import { useAccount } from 'wagmi'
import Countdown from 'react-countdown'
import { Tooltip, ToggleSwitch } from 'flowbite-react'
import { BAL_EMISSIONS_PER_WEEK } from '@/lib/consts'

const TetuBal: FC = () => {
	const { isConnected, address } = useAccount()
	const [sortBy, setSortBy] = useState('scoreTotal')
	const [sortDirection, setSortDirection] = useState('desc')
	const [showBribeModal, setShowBribeModal] = useState(false)
	const [hideHiddenHandData, setHideHiddenHandData] = useState(false)

	function updateSort(newSortBy) {
		if (sortBy === newSortBy) {
			setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
		} else {
			setSortBy(newSortBy)
			setSortDirection('desc')
		}
	}

	const { data, error, mutate } = useSWR('/api/tetu-bal', fetcher)

	const snapshotUrl = data
		? `https://snapshot.org/#/${data.snapshotData.proposal.space.id}/proposal/${data.snapshotData.proposal.id}`
		: undefined

	let tableData = []
	let emissionsPerVeBalUsd = BigNumber(0)
	let totalBribes = BigNumber(0)

	if (data) {
		// Calculate emissions per $veBAL
		emissionsPerVeBalUsd = BigNumber(BAL_EMISSIONS_PER_WEEK).div(data.veBalTotalSupply).times(data.balPrice)

		// Calculate total bribes (Tetu and HH)
		for (const b of data.bribes) totalBribes = totalBribes.plus(BigNumber(b.amountUsdc).shiftedBy(-6))

		if (!hideHiddenHandData) {
			for (const proposal of data.hiddenHandData) {
				for (const b of proposal.bribes) {
					totalBribes = totalBribes.plus(b.value)
				}
			}
		}

		// Calculate current user's VP for each choice
		const myVoteChoicesToVp = {}
		if (isConnected) {
			const myVote = data.snapshotData.votes.find(v => v.voter === address)
			if (myVote) {
				const myVoteVp = BigNumber(myVote.vp)
				const myTotalWeight = Object.values(myVote.choice).reduce(
					(a: BigNumber, b: BigNumber) => a.plus(b),
					BigNumber(0)
				)
				for (const [id, weight] of Object.entries(myVote.choice)) {
					const choice = data.snapshotData.proposal.choices[parseInt(id, 10) - 1]
					myVoteChoicesToVp[choice] = myVoteVp.times(weight.toString()).div(myTotalWeight.toString())
				}
			}
		}

		// calculate table data
		for (const i in data.snapshotData.proposal.choices) {
			const choice = data.snapshotData.proposal.choices[i]
			const tetuScore = BigNumber(data.snapshotData.proposal.scores[i])
			let hhScore = BigNumber(0)
			const gaugeAddressPrefix = choice.split('0x')[1].split(')')[0].toLowerCase()

			// find Tetu bribes
			let tetuBribeUsd = BigNumber(0)
			const matchingBribes = data.bribes.filter(b => b.gauge.toLowerCase().includes(gaugeAddressPrefix))
			for (const b of matchingBribes) tetuBribeUsd = tetuBribeUsd.plus(BigNumber(b.amountUsdc).shiftedBy(-6))

			// find HH bribes
			let hhBribeUsd = BigNumber(0)
			for (const proposal of data.hiddenHandData) {
				if (!proposal.proposal.toLowerCase().includes(gaugeAddressPrefix)) continue
				hhScore = BigNumber(proposal.voteCount)
				for (const b of proposal.bribes) {
					hhBribeUsd = hhBribeUsd.plus(b.value)
				}
				break
			}

			const scoreTotal = hideHiddenHandData ? tetuScore : tetuScore.plus(hhScore)

			const totalBribeUsd = hideHiddenHandData ? tetuBribeUsd : tetuBribeUsd.plus(hhBribeUsd)

			// count tetu bribes divided by the number of tetu votes
			const bribePerVoteTetu = tetuScore.gt(0) ? tetuBribeUsd.div(tetuScore) : BigNumber(0)

			// count hidden hand bribes, divided by (submitted hh votes + pending tetu votes)
			const bribePerVoteHH = scoreTotal.gt(0) ? hhBribeUsd.div(scoreTotal) : BigNumber(0)
			const bribePerVoteTotal = hideHiddenHandData ? bribePerVoteTetu : bribePerVoteTetu.plus(bribePerVoteHH)
			const myVotes = myVoteChoicesToVp[choice] || BigNumber(0)
			const myBribes = bribePerVoteTotal.times(myVotes)

			tableData.push({
				choice,
				tetuScore,
				hhScore,
				scoreTotal,
				tetuBribeUsd,
				hhBribeUsd,
				totalBribeUsd,
				bribePerVoteHH,
				bribePerVoteTetu,
				bribePerVoteTotal,
				myVotes,
				myBribes,
			})
		}
	}

	tableData.sort((a, b) => {
		if (typeof a[sortBy] === 'string' && isNaN(a[sortBy])) {
			return a[sortBy].localeCompare(b[sortBy])
		} else {
			return BigNumber(a[sortBy]).gt(b[sortBy]) ? -1 : 1
		}
	})

	if (sortDirection === 'asc') tableData.reverse()

	return (
		<div className="max-w-5xl mx-auto px-6 pt-4">
			<div className="text-justify">
				<p>
					TetuBal is the liquid-staking wrapper for{' '}
					<a href="https://balancer.fi/" target="_blank" rel="noreferrer">
						Balancer&rsquo;s
					</a>{' '}
					$veBAL governance token, which is created by permanently locking 20WETH-80BAL LP tokens on Ethereum
					Mainnet. Currently, Tetu&rsquo;s $veBAL voting power is split in an interesting way: $TetuBAL tokens
					in the LP are controlled by $dxTETU holders, whereas users who hold $TetuBAL tokens in their wallet
					maintain their governance rights.
				</p>
			</div>

			<div className="grid md:grid-cols-3 gap-4 py-6">
				<InfoBubble loading={!data} title="$tetuBAL supply">
					{data ? BigNumber(data.tetuBalTotalSupply).toFormat(0) : ''}
				</InfoBubble>
				<InfoBubble loading={!data} title="Emissions per veBAL (weekly)">
					${emissionsPerVeBalUsd.toFixed(2)}
				</InfoBubble>
				<InfoBubble
					loading={!data}
					title={hideHiddenHandData ? 'Total Bribes (Tetu only)' : 'Total Bribes (incl. Hidden Hand)'}
				>
					${totalBribes ? totalBribes.toFixed(2) : '-'}
				</InfoBubble>
			</div>

			{data ? (
				<>
					<BribeModal
						show={showBribeModal}
						choicesToGaugeAddress={data.choicesToGaugeAddress}
						onClose={() => {
							setShowBribeModal(false)
							mutate()
						}}
					/>
					<div className="flex justify-between">
						<h2 className="text-2xl pb-2">{data.snapshotData.proposal.title}</h2>
						<div className="pt-1">
							Time remaining to vote: &nbsp;
							<div className="inline p-2 rounded-md bg-slate-800 font-mono">
								<Countdown date={data.snapshotData.proposal.end * 1000} />
							</div>
						</div>
					</div>
					<div className="flex justify-between">
						<h3 className="text-sm text-slate-400">
							<a href={snapshotUrl} target="_blank" rel="noreferrer">
								Vote on Snapshot.org &nbsp;
								<InboxArrowDownIcon className="inline w-4 mb-1" />
							</a>
							{isConnected ? (
								<span
									className="ml-4 underline hover:no-underline cursor-pointer"
									onClick={() => setShowBribeModal(true)}
								>
									Add a bribe &nbsp;
									<BanknotesIcon className="inline w-4 mb-1" />
								</span>
							) : (
								<span className="ml-4 cursor-pointer text-slate-600 tooltip-wrapper">
									<Tooltip content="You must connect your wallet to add a bribe" placement="top">
										Add a bribe &nbsp;
										<BanknotesIcon className="inline w-4 mb-1" />
									</Tooltip>
								</span>
							)}
							<a
								href="https://hiddenhand.finance/balancer"
								className="ml-4"
								target="_blank"
								rel="noreferrer"
							>
								View on Hidden Hand &nbsp;
								<ArrowTopRightOnSquareIcon className="inline w-4 mb-1" />
							</a>
						</h3>
						<ToggleSwitch
							checked={hideHiddenHandData}
							label="Hide data from Hidden Hand"
							onChange={v => setHideHiddenHandData(v)}
						/>
					</div>

					<div className="overflow-x-auto relative pt-4">
						<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
							<thead className="whitespace-nowrap text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
								<tr>
									<th scope="col" className="py-3 px-6" onClick={() => updateSort('choice')}>
										Title{' '}
										<SortIndicator
											sortBy={sortBy}
											sortDirection={sortDirection}
											thisIndex={'choice'}
										/>
									</th>
									<th scope="col" className="py-3 px-6" onClick={() => updateSort('scoreTotal')}>
										Total Votes{' '}
										<SortIndicator
											sortBy={sortBy}
											sortDirection={sortDirection}
											thisIndex={'scoreTotal'}
										/>
									</th>
									<th scope="col" className="py-3 px-6" onClick={() => updateSort('totalBribeUsd')}>
										$ Bribes{' '}
										<SortIndicator
											sortBy={sortBy}
											sortDirection={sortDirection}
											thisIndex={'totalBribeUsd'}
										/>
									</th>
									<th
										scope="col"
										className="py-3 px-6"
										onClick={() => updateSort('bribePerVoteTotal')}
									>
										$/vote{' '}
										<SortIndicator
											sortBy={sortBy}
											sortDirection={sortDirection}
											thisIndex={'bribePerVoteTotal'}
										/>
									</th>
									<th scope="col" className="py-3 px-6" onClick={() => updateSort('myVotes')}>
										My Votes{' '}
										<SortIndicator
											sortBy={sortBy}
											sortDirection={sortDirection}
											thisIndex={'myVotes'}
										/>
									</th>
									<th scope="col" className="py-3 px-6" onClick={() => updateSort('myBribes')}>
										My Bribes{' '}
										<SortIndicator
											sortBy={sortBy}
											sortDirection={sortDirection}
											thisIndex={'myBribes'}
										/>
									</th>
								</tr>
							</thead>
							<tbody>
								{tableData.map(function (td, i) {
									return (
										<tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={i}>
											<th
												scope="row"
												className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
											>
												{td.choice}
												&nbsp;
												<a
													href={`https://etherscan.io/address/${
														data.choicesToGaugeAddress[td.choice]
													}`}
													target="_blank"
													rel="noreferrer"
												>
													<ArrowTopRightOnSquareIcon className="inline w-4 mb-1 text-slate-600" />
												</a>
											</th>
											<td className="py-4 px-6">{BigNumber(td.scoreTotal).toFixed(2)}</td>
											<td className="py-4 px-6">
												{td.totalBribeUsd.gt(0) ? '$' + td.totalBribeUsd.toFixed(0) : '-'}
												{!hideHiddenHandData && td.hhBribeUsd.gt(0) ? (
													<>
														&nbsp;
														<div className="tooltip-wrapper">
															<Tooltip
																className="max-w-s"
																content={`Tetu bribes: $${td.tetuBribeUsd.toFixed(
																	2
																)}, Hidden Hand bribes: $${td.hhBribeUsd.toFixed(2)}`}
																placement="top"
															>
																<QuestionMarkCircleIcon className="inline w-4 text-slate-600" />
															</Tooltip>
														</div>
													</>
												) : (
													''
												)}
											</td>
											<td className="py-4 px-6">
												{td.bribePerVoteTotal.gt(0)
													? '$' + td.bribePerVoteTotal.toFixed(2)
													: '-'}

												{!hideHiddenHandData && td.bribePerVoteHH.gt(0) ? (
													<>
														&nbsp;
														<div className="tooltip-wrapper">
															<Tooltip
																className="max-w-s"
																content={`Tetu $/dxTETU: $${td.bribePerVoteTetu.toFixed(
																	2
																)}, Hidden Hand $/veBAL: $${td.bribePerVoteHH.toFixed(
																	2
																)}`}
																placement="top"
															>
																<QuestionMarkCircleIcon className="inline w-4 text-slate-600" />
															</Tooltip>
														</div>
													</>
												) : (
													''
												)}
											</td>
											<td className="py-4 px-6">
												{td.myVotes.gt(0) ? BigNumber(td.myVotes).toFixed(2) : '-'}
											</td>
											<td className="py-4 px-6">
												{td.myBribes.gt(0) ? '$' + BigNumber(td.myBribes).toFixed(2) : '-'}
											</td>
										</tr>
									)
								})}
							</tbody>
							<tfoot>
								<tr className="bg-white border-b dark:bg-gray-600 dark:border-gray-700">
									<th
										scope="row"
										className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
									>
										Totals:
									</th>
									<td className="py-4 px-6">
										{tableData
											.map(td => td.scoreTotal)
											.reduce((a, b) => a.plus(b), BigNumber(0))
											.toFixed(2)}
									</td>
									<td className="py-4 px-6">
										$
										{tableData
											.map(td => td.totalBribeUsd)
											.reduce((a, b) => a.plus(b), BigNumber(0))
											.toFixed(2)}
									</td>
									<td className="py-4 px-6">
										$
										{tableData
											.map(td => td.bribePerVoteTotal)
											.reduce((a, b) => a.plus(b), BigNumber(0))
											.toFixed(2)}
									</td>
									<td className="py-4 px-6">
										{tableData
											.map(td => td.myVotes)
											.reduce((a, b) => a.plus(b), BigNumber(0))
											.toFixed(2)}
									</td>
									<td className="py-4 px-6">
										$
										{tableData
											.map(td => td.myBribes)
											.reduce((a, b) => a.plus(b), BigNumber(0))
											.toFixed(2)}
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</>
			) : (
				<FakeTable />
			)}
		</div>
	)
}

export default TetuBal
