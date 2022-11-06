import { FC, useState } from 'react'
import { Modal, Button, Label, TextInput, Select, Alert } from 'flowbite-react'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { useAccount, useProvider, erc20ABI, useSigner } from 'wagmi'
import { Contract } from '@ethersproject/contracts'
import { TETUBAL_BRIBE_VAULT_ADDRESS, CURRENT_SNAPSHOT_PROPOSAL_ID } from '@/lib/consts'
import { keccak256 } from '@ethersproject/keccak256'

const BribeModal: FC<{ show: boolean; onClose: Function; choicesToGaugeAddress: any }> = ({
	show,
	onClose,
	choicesToGaugeAddress,
}) => {
	function doClose() {
		setError('')
		setStep(0)
		onClose()
	}

	const { address } = useAccount()
	const provider = useProvider()
	const { data: signer } = useSigner()

	const [error, setError] = useState('')
	const [step, setStep] = useState(0)

	const [gaugeAddress, setGaugeAddress] = useState(Object.values(choicesToGaugeAddress)[0])
	const [tokenAddressRaw, setTokenAddressRaw] = useState('')
	const [bribeAmountRaw, setBribeAmountRaw] = useState('')
	const [isLoadingConfirmPage, setIsLoadingConfirmPage] = useState(false)

	const [tokenSymbol, setTokenSymbol] = useState('')
	const [tokenDecimals, setTokenDecimals] = useState(0)
	const [bribeAmountParsed, setBribeAmountParsed] = useState(BigNumber.from(0))
	const [needsApprove, setNeedsApprove] = useState(false)
	const [isSigningTransaction, setIsSigningTransaction] = useState(false)
	const [isWaitingForTransaction, setIsWaitingForTransaction] = useState(false)

	async function loadConfirmPage() {
		try {
			setError('')
			setIsLoadingConfirmPage(true)

			const tokenContract = new Contract(tokenAddressRaw, erc20ABI, provider)

			const [gotBalance, gotSymbol, gotDecimals, gotAllowance] = await Promise.all([
				tokenContract.balanceOf(address),
				tokenContract.symbol(),
				tokenContract.decimals(),
				tokenContract.allowance(address, TETUBAL_BRIBE_VAULT_ADDRESS),
			])

			const amtParsed = parseUnits(bribeAmountRaw, gotDecimals)

			if (gotBalance.lt(amtParsed)) {
				setIsLoadingConfirmPage(false)
				setError(
					`Token balance ${formatUnits(gotBalance, gotDecimals)} is less than bribe amount ${formatUnits(
						amtParsed,
						gotDecimals
					)}`
				)
				return
			}

			setBribeAmountParsed(amtParsed)
			setTokenDecimals(gotDecimals)
			setTokenSymbol(gotSymbol)
			setNeedsApprove(gotAllowance.lt(amtParsed))
			setStep(2)
			setIsLoadingConfirmPage(false)
		} catch (err) {
			setIsLoadingConfirmPage(false)
			setError(`Error parsing bribe information: ${err.toString()}`)
		}
	}

	async function submitBribe() {
		setError('')
		setIsSigningTransaction(true)

		if (needsApprove) {
			try {
				const tokenContract = new Contract(tokenAddressRaw, erc20ABI, provider)
				const tx = await tokenContract.connect(signer).approve(TETUBAL_BRIBE_VAULT_ADDRESS, bribeAmountParsed)
				setIsWaitingForTransaction(true)
				await tx.wait()
				setIsWaitingForTransaction(false)
				setNeedsApprove(false)
			} catch (err) {
				setError(`Error: ${err}`)
			} finally {
				setIsSigningTransaction(false)
			}
		} else {
			try {
				const bribeVaultContract = new Contract(
					TETUBAL_BRIBE_VAULT_ADDRESS,
					require('@/abi/BribeVault.json'),
					provider
				)
				const tx = await bribeVaultContract
					.connect(signer)
					.createBribe(
						keccak256(CURRENT_SNAPSHOT_PROPOSAL_ID),
						gaugeAddress,
						tokenAddressRaw,
						bribeAmountParsed
					)
				setIsWaitingForTransaction(true)
				await tx.wait()
				setIsWaitingForTransaction(false)
				doClose()
			} catch (err) {
				setError(`Error: ${err}`)
			} finally {
				setIsSigningTransaction(false)
			}
		}
	}

	return (
		<Modal size="lg" show={show} onClose={doClose}>
			{step === 0 ? (
				<>
					<Modal.Header>Info for bribers</Modal.Header>
					<Modal.Body>
						<div className="space-y-6">
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								You can deposit a bribe token here, and it will be used to incentivize voters to vote
								for your gauge.
							</p>
							<p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
								Please note that in order to prevent spam, your bribe must have a value of at least $10.
								If you wish to deposit an uncommon token that is not natively supported by our pricer,
								please contact us so that we can add you to the allowlist.
							</p>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Button
							className="grow text-center"
							size="xl"
							onClick={() => {
								setStep(1)
							}}
						>
							Continue
						</Button>
					</Modal.Footer>
				</>
			) : (
				''
			)}

			{step === 1 ? (
				<>
					<Modal.Header>Enter bribe details</Modal.Header>
					<Modal.Body>
						{error ? (
							<Alert color="failure" className="mb-4">
								<span>
									<span className="font-medium">{error}</span>
								</span>
							</Alert>
						) : (
							''
						)}

						<div className="">
							<form className="flex flex-col gap-4">
								<div className="mb-2">
									<div className="mb-2 block">
										<Label htmlFor="gaugeAddress" value="Gauge to bribe" />
									</div>
									<Select
										id="gaugeAddress"
										required={true}
										value={gaugeAddress.toString()}
										onChange={e => setGaugeAddress(e.target.value)}
									>
										{Object.entries(choicesToGaugeAddress).map(function ([name, addr]) {
											return (
												<option value={addr.toString()} key={addr.toString()}>
													{name}
												</option>
											)
										})}
									</Select>
								</div>
								<div className="mb-2">
									<div className="mb-2 block">
										<Label htmlFor="tokenAddress" value="Bribe token address (Polygon)" />
									</div>
									<TextInput
										id="tokenAddress"
										type="text"
										placeholder="0x"
										value={tokenAddressRaw}
										onChange={e => setTokenAddressRaw(e.target.value)}
										required={true}
									/>
								</div>
								<div>
									<div className="mb-2 block">
										<Label htmlFor="bribeAmount" value="Bribe amount" />
									</div>
									<TextInput
										id="bribeAmount"
										type="number"
										step="any"
										placeholder="100.00"
										value={bribeAmountRaw}
										onChange={e => setBribeAmountRaw(e.target.value)}
										required={true}
									/>
								</div>
							</form>
						</div>
					</Modal.Body>
					<Modal.Footer>
						{isLoadingConfirmPage ? (
							<Button className="grow text-center" size="xl" disabled={true}>
								Loading...
							</Button>
						) : (
							<Button
								className="grow text-center"
								size="xl"
								onClick={loadConfirmPage}
								disabled={!gaugeAddress || !tokenAddressRaw || !bribeAmountRaw}
							>
								Continue
							</Button>
						)}
					</Modal.Footer>
				</>
			) : (
				''
			)}

			{step === 2 ? (
				<>
					<Modal.Header>Confirm bribe</Modal.Header>
					<Modal.Body>
						{error ? (
							<Alert color="failure" className="mb-4">
								<span>
									<span className="font-medium">{error}</span>
								</span>
							</Alert>
						) : (
							''
						)}
						<dl>
							<dt className="text-md font-medium text-gray-200">Gauge</dt>
							<dd className="mt-1 text-md text-gray-300">
								{' '}
								<a
									href={`https://etherscan.io/address/${gaugeAddress}`}
									target="_blank"
									rel="noreferrer"
								>
									{gaugeAddress.toString()}
								</a>
							</dd>
							<dt className="mt-6 text-md font-medium text-gray-200">Bribe amount</dt>
							<dd className="mt-1 text-md text-gray-300">
								{formatUnits(bribeAmountParsed, tokenDecimals)}
								&nbsp;
								<a
									href={`https://polygonscan.com/address/${tokenAddressRaw}`}
									target="_blank"
									rel="noreferrer"
								>
									{tokenSymbol}
								</a>
							</dd>
						</dl>
					</Modal.Body>
					<Modal.Footer>
						{isSigningTransaction ? (
							<Button className="grow text-center" size="xl" disabled={true}>
								{isWaitingForTransaction ? 'Waiting for transaction...' : 'Loading...'}
							</Button>
						) : (
							<Button className="grow text-center" size="xl" onClick={submitBribe}>
								{needsApprove ? 'Approve token spend' : 'Submit bribe'}
							</Button>
						)}
					</Modal.Footer>
				</>
			) : (
				''
			)}
		</Modal>
	)
}

export default BribeModal
