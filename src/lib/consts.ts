export const APP_NAME = 'Tetu.Community'
export const FEE_PERCENT = 2

// these will change each round:
export const ROUNDS = [
	{
		number: 18,
		title: 'BRV-018: Gauge Weight for Week of 13th April 2023',
		proposalId: '0xbea1a695a085c1f45a7f37cf318fb2ee4dead77e62ea4b12d3315c7deab267c6',
		bribeProposalId: '0xbea1a695a085c1f45a7f37cf318fb2ee4dead77e62ea4b12d3315c7deab267c6',
		hhBalancerDeadline: 1681948800,
    maxBribePerVote: '-'
	},
	{
		number: 17,
		title: 'BRV-017: Gauge Weight for Week of 30th March 2023',
		proposalId: '0x5e843160c27645bb8b42d6eb75adc4fdb03858081bec18f5d92b2fe9befd4533',
		bribeProposalId: '0x5e843160c27645bb8b42d6eb75adc4fdb03858081bec18f5d92b2fe9befd4533',
		hhBalancerDeadline: 1680739200,
	},
	{
		number: 16,
		title: 'BRV-016: Gauge Weight for Week of 16th March 2023',
		proposalId: '0x550b9bc05ff51cdc41509efb0de891d4041ba7e66d569a96b6a741b73839a1f1',
		bribeProposalId: '0x550b9bc05ff51cdc41509efb0de891d4041ba7e66d569a96b6a741b73839a1f1',
		hhBalancerDeadline: 1679529600,
	},
	{
		number: 15,
		title: 'BRV-015: Gauge Weight for Week of 2nd March 2023',
		proposalId: '0x7d3385edf6a38827adb4897e59646f9a0693274db7912e72b0680caf79806ed2',
		bribeProposalId: '0x7d3385edf6a38827adb4897e59646f9a0693274db7912e72b0680caf79806ed2',
		hhBalancerDeadline: 1678320000,
	},
	{
		number: 14,
		title: 'BRV-014: Gauge Weight for Week of 16th February 2023',
		proposalId: '0x681a54e643bccd2408d3d25320db046b28d913b947c865cbd927aa7f6ae83455',
		bribeProposalId: '0x681a54e643bccd2408d3d25320db046b28d913b947c865cbd927aa7f6ae83455',
		hhBalancerDeadline: 1677110400,
	},
	{
		number: 13,
		title: 'BRV-013: Gauge Weight for Week of 2nd February 2023',
		proposalId: '0x3ed177443d7d9bbd255f4ee17a88fa3c670e5b1f48df0a06e79e18500b25c966',
		bribeProposalId: '0x3ed177443d7d9bbd255f4ee17a88fa3c670e5b1f48df0a06e79e18500b25c966',
		hhBalancerDeadline: 1675900800,
	},
	{
		number: 12,
		title: 'BRV-012: Gauge Weight for Week of 19th January 2023',
		proposalId: '0x1b5e8ee8e555f5efe3700d4797a4df6621925b85bbf04eb5e6379c0ca0035ef3',
		bribeProposalId: '0x1b5e8ee8e555f5efe3700d4797a4df6621925b85bbf04eb5e6379c0ca0035ef3',
		hhBalancerDeadline: 1674691200,
	},
	{
		number: 11,
		title: 'BRV-011: Gauge Weight for Week of 5th January 2023',
		proposalId: '0x16dd3c8934d08ab5b3dca6a90ea135a2a9e80a222f0334e9263407000cf2cfb4',
		bribeProposalId: '0x16dd3c8934d08ab5b3dca6a90ea135a2a9e80a222f0334e9263407000cf2cfb4',
		hhBalancerDeadline: 1673481600,
	},
	{
		number: 10,
		title: 'BRV-010: Gauge Weight for Week of 22nd December 2022',
		proposalId: '0x06f4562be6c133d755e01f6eab7a0462cb3c5ced2b65ad32abb36ca49af47a37',
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

// changes every year: https://docs.google.com/spreadsheets/d/1FY0gi596YWBOTeu_mrxhWcdF74SwKMNhmu0qJVgs0KI/edit#gid=0
export const BAL_EMISSIONS_PER_WEEK = 121929

// addresses, etc, should not change:
export const XTETU_ADDRESS = '0x225084D30cc297F3b177d9f93f5C3Ab8fb6a1454'
export const DXTETU_ADDRESS = '0xAcEE7Bd17E7B04F7e48b29c0C91aF67758394f0f'
export const VETETU_POWER_ADDRESS = '0x9c744b553821f2a4eDe60b4459F04433Ea57146A'
export const VETETU_ADDRESS = '0x6FB29DD17fa6E27BD112Bc3A2D0b8dae597AeDA4'
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
export const USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
export const BAL_GAUGE_CONTROLLER_ADDRESS = '0xC128468b7Ce63eA702C1f104D55A2566b13D3ABD'

export const GAUGE_TYPES_TO_CHAIN_NAME = {
	2: 'Ethereum',
	3: 'Polygon',
	4: 'Arbitrum',
	5: 'Optimism',
}
