import BigNumber from 'bignumber.js'
import { NextApiRequest, NextApiResponse } from 'next'
import { mainnetProvider, polygonProvider } from '@/lib/ethers'
import { ROUNDS } from '@/lib/consts'

import {
	getCoingeckoPrice,
	getSnapshotData,
	getTotalSupply,
	getAllGaugesFromSubgraph,
	getBribeData,
	getHiddenHandData,
	getBalanceOf,
	getQuestData,
} from './shared'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const roundData = ROUNDS.find(r => r.number === parseInt(req.query.n.toString()))
	if (!roundData) return res.send(404)

	const [balPrice, tetuBalTotalSupply, veBalTotalSupply, snapshotData, bribes, allGauges, hiddenHandData, questData] =
		await Promise.all([
			getCoingeckoPrice('balancer'),
			getBalanceOf(
				mainnetProvider,
				'0xC128a9954e6c874eA3d62ce62B468bA073093F25',
				'0x9cC56Fa7734DA21aC88F6a816aF10C5b898596Ce'
			),
			getTotalSupply(mainnetProvider, '0xC128a9954e6c874eA3d62ce62B468bA073093F25'),
			getSnapshotData(roundData.proposalId),
			getBribeData(polygonProvider, roundData.bribeProposalId),
			getAllGaugesFromSubgraph(),
			getHiddenHandData(roundData.hhBalancerDeadline),
			getQuestData(),
		])

	const choicesToGaugeAddress = {}
	const choicesToGaugeTypes = {}

	for (const choice of snapshotData.proposal.choices) {
		const prefix = choice.split('0x')[1].split(')')[0]
		const found = allGauges.find(g => g.address.startsWith('0x' + prefix))
		if (found) {
			choicesToGaugeAddress[choice] = found.address
			choicesToGaugeTypes[choice] = found.gaugeType
		}
	}

	res.status(200).json({
		balPrice,
		tetuBalTotalSupply,
		veBalTotalSupply,
		snapshotData,
		bribes,
		choicesToGaugeAddress,
		choicesToGaugeTypes,
		hiddenHandData,
		questData,
	})
}

export default handler
