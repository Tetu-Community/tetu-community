import axios from 'axios'
import { request, gql } from 'graphql-request'
import BigNumber from 'bignumber.js'
import { Contract } from '@ethersproject/contracts'
import ms from 'ms'
import { TETUBAL_BRIBE_VAULT_ADDRESS, TETU_LIQUIDATOR_ADDRESS, USDC_ADDRESS } from '@/lib/consts'
import { keccak256 } from '@ethersproject/keccak256'
const SNAPSHOT_GRAPHQL_ENDPOINT = 'https://hub.snapshot.org/graphql'

export async function getCoingeckoPrice(id: string): Promise<BigNumber> {
	const resp = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`)
	const rawPrice = resp.data.market_data.current_price.usd
	return BigNumber(rawPrice)
}

export async function getTotalSupply(provider: any, address: string): Promise<BigNumber> {
	const c = new Contract(address, ['function totalSupply() external view returns (uint)'], provider)

	return BigNumber((await c.totalSupply()).toString()).shiftedBy(-18)
}

export async function getPricePerFullShare(provider: any, address: string): Promise<BigNumber> {
	const c = new Contract(address, ['function getPricePerFullShare() external view returns (uint)'], provider)

	return BigNumber((await c.getPricePerFullShare()).toString()).shiftedBy(-18)
}

export async function getTetuCirculatingSupply(): Promise<BigNumber> {
	const resp = await axios.get('https://api.tetu.io/api/v1/info/circulationSupply')
	return BigNumber(resp.data)
}

export async function getTetuTvlUsd(
	provider: any,
	contractReaderAddress: string,
	vaultAddress: string
): Promise<BigNumber> {
	const c = new Contract(
		contractReaderAddress,
		['function vaultTvlUsdc(address _vault) public view returns (uint256)'],
		provider
	)

	return BigNumber((await c.vaultTvlUsdc(vaultAddress)).toString()).shiftedBy(-18)
}

export async function getPpfsApr(
	provider: any,
	contractReaderAddress: string,
	vaultAddress: string
): Promise<BigNumber> {
	const c = new Contract(
		contractReaderAddress,
		['function vaultPpfsApr(address _vault) public view returns (uint256)'],
		provider
	)

	return BigNumber((await c.vaultPpfsApr(vaultAddress)).toString()).shiftedBy(-18)
}

export async function getBalanceOf(provider: any, contractAddress: string, userAddress: string): Promise<BigNumber> {
	const c = new Contract(
		contractAddress,
		['function balanceOf(address _user) public view returns (uint256)'],
		provider
	)

	return BigNumber((await c.balanceOf(userAddress)).toString()).shiftedBy(-18)
}

export async function getSnapshotData(proposalId: string): Promise<any> {
	const resp = await request(
		SNAPSHOT_GRAPHQL_ENDPOINT,
		gql`
    query {
      proposals (
        where: {
          id: "${proposalId}"
        }
      ) {
        id
        title
        choices
        start
        end
        scores
        space {
          id
          name
        }
      }

      votes (
        first: 10000,
        skip: 0,
        where: {
          proposal: "${proposalId}"
        }
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        voter
        vp
        choice
      }
    }
  `
	)

	return {
		proposal: resp.proposals[0],
		votes: resp.votes,
	}
}

export async function getAllGaugeAddresses(): Promise<any> {
	const resp = await request(
		'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges',
		gql`
			query {
				gauges(first: 1000) {
					address
				}
			}
		`
	)

	return resp.gauges.map(g => g.address)
}

export async function getBribeData(provider: any, proposalId: string): Promise<any> {
	const c = new Contract(TETUBAL_BRIBE_VAULT_ADDRESS, require('@/abi/BribeVault.json'), provider)
	const res = await c.bribesByEpoch(keccak256(proposalId))

	const retBribes = []

	for (const b of res) {
		retBribes.push({
			gauge: b.gauge,
			token: b.bribeToken,
			amount: b.amount,
		})
	}

	const tetuLiquidator = new Contract(
		TETU_LIQUIDATOR_ADDRESS,
		['function getPrice(address tokenIn, address tokenOut, uint amount) external view returns (uint)'],
		provider
	)

	await Promise.all(
		retBribes.map(async function (b, i) {
			try {
				retBribes[i].amountUsdc = await tetuLiquidator.getPrice(b.token, USDC_ADDRESS, b.amount)
			} catch (err) {
				// nada
			}
		})
	)

	// convert bignumber to string
	return retBribes.map(b => {
		return {
			...b,
			amount: b.amount.toString(),
			amountUsdc: b.amountUsdc.toString(),
		}
	})
}

export async function getHiddenHandBribeData() {
	// TODO: dynamically grab this URL
	const res = await axios.get('https://hiddenhand.finance/_next/data/SE1CxiBzgGk69sCJJhwEQ/balancer.json')

	const ret = {
		totalVote: BigNumber(res.data.pageProps.partnerSettingsData.totalVote),
		currentVote: BigNumber(0),
		bribes: {},
	}

	for (const p of res.data.pageProps.proposalsData) {
		ret.currentVote = ret.currentVote.plus(p.voteCount)
		if (p.totalValue === 0) continue
		ret.bribes[p.proposal] = p.totalValue
	}

	return ret
}
