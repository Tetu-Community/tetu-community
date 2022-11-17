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
} from './shared'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const roundData = ROUNDS.find(r => r.number === parseInt(req.query.n.toString()))
	if (!roundData) return res.send(404)

	const [balPrice, tetuBalTotalSupply, veBalTotalSupply, snapshotData, bribes, allGauges, hiddenHandData] =
		await Promise.all([
			getCoingeckoPrice('balancer'),
			getTotalSupply(polygonProvider, '0x7fC9E0Aa043787BFad28e29632AdA302C790Ce33'),
			getTotalSupply(mainnetProvider, '0xC128a9954e6c874eA3d62ce62B468bA073093F25'),
			getSnapshotData(roundData.proposalId),
			getBribeData(polygonProvider, roundData.bribeProposalId),
			getAllGaugesFromSubgraph(),
			getHiddenHandData(roundData.hhBalancerDeadline),
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
	})
}

export default handler
