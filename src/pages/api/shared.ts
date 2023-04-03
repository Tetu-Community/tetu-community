import { BigNumber as ebn } from 'ethers'
import axios from 'axios'
import { request, gql } from 'graphql-request'
import BigNumber from 'bignumber.js'
import { Contract } from '@ethersproject/contracts'
import ms from 'ms'
import {
	FEE_PERCENT,
	TETUBAL_BRIBE_VAULT_ADDRESS,
	TETU_LIQUIDATOR_ADDRESS,
	USDC_ADDRESS,
  USDT_ADDRESS,
	BAL_GAUGE_CONTROLLER_ADDRESS,
	TETU_BAL_LOCKER_ADDRESS,
  ROUNDS
} from '@/lib/consts'
import { keccak256 } from '@ethersproject/keccak256'
import { erc20ABI } from 'wagmi'
import { mainnetProvider } from '@/lib/ethers'
import gaugeControllerAbi from '@/abi/GaugeController.json'
import range from 'lodash.range'

const SNAPSHOT_GRAPHQL_ENDPOINT = 'https://hub.snapshot.org/graphql'

export async function getCoingeckoPrice(id: string): Promise<BigNumber> {
	const resp = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`)
	const rawPrice = resp.data.market_data.current_price.usd
	return new BigNumber(rawPrice)
}

export async function getTotalSupply(provider: any, address: string): Promise<BigNumber> {
	const c = new Contract(address, ['function totalSupply() external view returns (uint)'], provider)

	return new BigNumber((await c.totalSupply()).toString()).shiftedBy(-18)
}

export async function getPricePerFullShare(provider: any, address: string): Promise<BigNumber> {
	const c = new Contract(address, ['function getPricePerFullShare() external view returns (uint)'], provider)

	return new BigNumber((await c.getPricePerFullShare()).toString()).shiftedBy(-18)
}

export async function getTetuCirculatingSupply(): Promise<BigNumber> {
	const resp = await axios.get('https://api.tetu.io/api/v1/info/circulationSupply')
	return new BigNumber(resp.data)
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

	return new BigNumber((await c.vaultTvlUsdc(vaultAddress)).toString()).shiftedBy(-18)
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

	return new BigNumber((await c.vaultPpfsApr(vaultAddress)).toString()).shiftedBy(-18)
}

export async function getBalanceOf(provider: any, contractAddress: string, userAddress: string): Promise<BigNumber> {
	const c = new Contract(
		contractAddress,
		['function balanceOf(address _user) public view returns (uint256)'],
		provider
	)

	return new BigNumber((await c.balanceOf(userAddress)).toString()).shiftedBy(-18)
}

export async function getSnapshotData(proposalId: string): Promise<any> {
	const resp: any = await request(
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
        first: 1000,
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

	if (resp.votes.length === 1000) throw new Error('need to impl pagination')

	return {
		proposal: resp.proposals[0],
		votes: resp.votes,
	}
}

export async function getAllGaugesFromSubgraph(): Promise<any> {
	const resp: any = await request(
		'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges',
		gql`
			query {
				gauges(first: 1000) {
					address
					type {
						id
					}
				}
			}
		`
	)

	return resp.gauges.map(g => {
		return {
			address: g.address,
			gaugeType: g.type.id,
		}
	})
}

export async function getBribeData(provider: any, proposalId: string): Promise<any> {
	const c = new Contract(TETUBAL_BRIBE_VAULT_ADDRESS, require('@/abi/BribeVault.json'), provider)
	const res = await c.bribesByEpoch(keccak256(proposalId))

	const retBribes = []

	for (const b of res) {
		const fee = b.amount.mul(FEE_PERCENT).div(100)

		retBribes.push({
			gauge: b.gauge,
			token: b.bribeToken,
			amount: b.amount.sub(fee),
		})
	}

	const tetuLiquidator = new Contract(
		TETU_LIQUIDATOR_ADDRESS,
		['function getPrice(address tokenIn, address tokenOut, uint amount) external view returns (uint)'],
		provider
	)

	await Promise.all(
		retBribes.map(async function (b, i) {
			const tokenContract = new Contract(b.token, erc20ABI, provider)

			try {
				const [tokenSymbol, tokenDecimals, amountUsdc] = await Promise.all([
					tokenContract.symbol(),
					tokenContract.decimals(),
					tetuLiquidator.getPrice(b.token, USDC_ADDRESS, b.amount),
				])

				retBribes[i].tokenSymbol = tokenSymbol
				retBribes[i].tokenDecimals = tokenDecimals
				retBribes[i].amountUsdc = isStable(b.token) ? b.amount : amountUsdc
			} catch (err) {
				console.log('error', err)
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

export async function getHiddenHandData(deadline) {
  const res = await axios.get(`https://api.hiddenhand.finance/proposal/balancer/${deadline}`)
  return res.data.data
}

export async function getCurrentTetuVeBALGaugeVotes() {
	const c = new Contract(BAL_GAUGE_CONTROLLER_ADDRESS, gaugeControllerAbi, mainnetProvider)

	// get all gauge addresses
	const gaugeAddresses = (await getAllGaugesFromSubgraph()).map(g => g.address)

	// get the "power" from the slope
	const powers: { [key: string]: BigNumber } = {}
	await Promise.all(
		gaugeAddresses.map(async function (gaugeAddress) {
			const res = await c.vote_user_slopes(TETU_BAL_LOCKER_ADDRESS, gaugeAddress)
			if (res.power.eq(0)) return
			powers[gaugeAddress] = new BigNumber(res.power.toString())
		})
	)

	// get the total power (this might always be 10,000, but we should still calculate it?)
	const sumPower = BigNumber.sum(...Object.values(powers))

	// calculate the percent of the Tetu vote for each gauge
	const percents = {}
	for (const [gaugeAddress, power] of Object.entries(powers)) {
		percents[gaugeAddress] = new BigNumber(power).div(sumPower).toFixed()
	}

	return percents
}

// Fetch gauge current bias & handle Quest blacklist feature
// Remove blacklisted addresses votes from gauge bias
async function getGaugeBiasBlacklist(gauge: string, blacklist: string[]): Promise<BigNumber> {
	const secPerWeek = 60 * 60 * 24 * 7
	const controllerContract = new Contract(BAL_GAUGE_CONTROLLER_ADDRESS, gaugeControllerAbi, mainnetProvider)

	if (blacklist.length === 0) {
		const bias = await controllerContract.get_gauge_weight(gauge)
		return new BigNumber(bias.toHexString())
	}

	const nextPeriod = (Math.trunc(Date.now() / (1000 * secPerWeek)) + 1) * secPerWeek

	const [gaugeBias, blacklistVotes] = await Promise.all([
		controllerContract.get_gauge_weight(gauge),
		Promise.all(
			blacklist.map(async addr => {
				const vote = await controllerContract.vote_user_slopes(addr, gauge)
				const bias = vote.slope.mul(vote.end.sub(nextPeriod))
				return bias.lte(0) ? 0 : bias
			})
		),
	])

	let blacklistTotal = ebn.from(0)
  for (const v of blacklistVotes) {
    blacklistTotal = blacklistTotal.add(v)
  }

	return gaugeBias.gte(blacklistTotal)
		? new BigNumber(gaugeBias.sub(blacklistTotal).toHexString()).shiftedBy(-18)
		: new BigNumber(0)
}

export async function getQuestData() {
	try {
		const res = await axios.get('https://api.warden.vote/boards/bal/active?usd')

		const quests = res.data.filter(q => !q.blacklist || !q.blacklist.includes(TETU_BAL_LOCKER_ADDRESS))

		const withBias = await Promise.all(
			quests.map(async quest => {
				const bias = await getGaugeBiasBlacklist(quest.gauge, quest.blacklist ? quest.blacklist : [])
				return { ...quest, bias }
			})
		)

		return withBias
	} catch (err) {
    console.log('getQuestData error', err)
		return []
	}
}

function isStable (tokenAddress) {
  if (tokenAddress === USDC_ADDRESS) return true
  if (tokenAddress === USDT_ADDRESS) return true
  return false
}
