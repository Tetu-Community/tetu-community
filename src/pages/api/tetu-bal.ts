import BigNumber from 'bignumber.js'
import { NextApiRequest, NextApiResponse } from 'next'
import { mainnetProvider, polygonProvider } from '@/lib/ethers'
import { SNAPSHOT_PROPOSAL_ID } from '@/constants'

import {
  getCoingeckoPrice,
  getSnapshotData,
  getTotalSupply,
  getAllGaugeAddresses,
  getBribeData
} from './shared'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const [
    balPrice,
    tetuBalTotalSupply,
    veBalTotalSupply,
    snapshotData,
    bribeData,
    allGaugeAddresses
  ] = await Promise.all([
    getCoingeckoPrice('balancer'),
    getTotalSupply(polygonProvider, '0x7fC9E0Aa043787BFad28e29632AdA302C790Ce33'),
    getTotalSupply(mainnetProvider, '0xC128a9954e6c874eA3d62ce62B468bA073093F25'),
    getSnapshotData(SNAPSHOT_PROPOSAL_ID),
    getBribeData(polygonProvider, SNAPSHOT_PROPOSAL_ID),
    getAllGaugeAddresses()
  ])

  const choicesToGaugeAddress = {}

  for (const choice of snapshotData.proposal.choices) {
    const prefix = choice.split('0x')[1].split(')')[0]
    const found = allGaugeAddresses.find(a => a.startsWith('0x' + prefix))
    if (found) choicesToGaugeAddress[choice] = found
  }

  res.status(200).json({
    balPrice,
    tetuBalTotalSupply,
    veBalTotalSupply,
    snapshotData,
    bribeData,
    choicesToGaugeAddress
  })
}

export default handler
