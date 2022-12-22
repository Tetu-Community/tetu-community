export const APP_NAME = 'Tetu.Community'

// these will change each round:
export const ROUNDS = [
	{
		number: 10,
		title: 'BRV-010: Gauge Weight for Week of 22nd December 2022',
		proposalId: '0x8726a8e75c2da8ca18fb317b085d50f8daa648cbc5dfa1349686b6f01119a191',
		bribeProposalId: '0x8726a8e75c2da8ca18fb317b085d50f8daa648cbc5dfa1349686b6f01119a191',
		hhBalancerDeadline: 1672272000,
	},
	{
		number: 9,
		title: 'BRV-009: Gauge Weight for Week of 8th December 2022',
		proposalId: '0xe21d871626555ef18e905aea3ec9c0b25f7d9214f834c515fa5480bd4bfc003b',
		bribeProposalId: '0xe21d871626555ef18e905aea3ec9c0b25f7d9214f834c515fa5480bd4bfc003b',
		hhBalancerDeadline: 1671062400,
	},
	{
		number: 8,
		title: 'BRV-008: Gauge Weight for Week of 24th November 2022',
		proposalId: '0x95093caa89673ccc16788dfa2ddf3ce5ea2a86eb82fc3d8185da691803657e08',
		bribeProposalId: '0x95093caa89673ccc16788dfa2ddf3ce5ea2a86eb82fc3d8185da691803657e08',
		hhBalancerDeadline: 1669852800,
	},
	{
		number: 7,
		title: 'BRV-007: Gauge Weight for Week of 10th November 2022',
		proposalId: '0xbf7cae30a9b8b2a56a11b767d58a623811ee7c9220069ad689a855a0d0006f03',
		bribeProposalId: '0xe5e1197c422f9f5d879b5cb7c5f641c64594ce2f98f830ddd2c8542df0611f11', // for fuckup
		hhBalancerDeadline: 1668643200,
	},
]

// changes every year?
export const BAL_EMISSIONS_PER_WEEK = 145000

// addresses, etc, should not change:
export const XTETU_ADDRESS = '0x225084D30cc297F3b177d9f93f5C3Ab8fb6a1454'
export const DXTETU_ADDRESS = '0xAcEE7Bd17E7B04F7e48b29c0C91aF67758394f0f'
export const TETU_CONTRACT_READER_POLYGON_ADDRESS = '0xCa9C8Fba773caafe19E6140eC0A7a54d996030Da'
export const TETUBAL_ADDRESS = '0x7fC9E0Aa043787BFad28e29632AdA302C790Ce33'
export const TETU_BAL_LOCKER_ADDRESS = '0x9cC56Fa7734DA21aC88F6a816aF10C5b898596Ce'
export const TETUQI_ADDRESS = '0x4Cd44ced63d9a6FEF595f6AD3F7CED13fCEAc768'
export const TETU_EQI_ADDRESS = '0x42702c28415aA436DBbd200e3E49215d75232ff1'
export const QIPOWAH_ADDRESS = '0x16591AD1634d46a1eeAe3b8Cbd438814fB94f9d7'
export const TETU_TETUQI_QI_LP_ADDRESS = '0x53d034c0d2680f39c61c9e7a03fb707a2a1b6e9b'
export const TETUBAL_BRIBE_VAULT_ADDRESS = '0x2dE7ab57966f7C98be4252f16350e7B185680020'
export const TETU_LIQUIDATOR_ADDRESS = '0xC737eaB847Ae6A92028862fE38b828db41314772'
export const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
export const BAL_GAUGE_CONTROLLER_ADDRESS = '0xC128468b7Ce63eA702C1f104D55A2566b13D3ABD'

export const GAUGE_TYPES_TO_CHAIN_NAME = {
	2: 'Ethereum',
	3: 'Polygon',
	4: 'Arbitrum',
	5: 'Optimism',
}
