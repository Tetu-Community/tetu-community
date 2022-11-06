import { FC, useState } from 'react'
import { Modal, Button, Label, TextInput, Select } from 'flowbite-react'

const BribeModal: FC<{ show: boolean; onClose: Function; choicesToGaugeAddress: any }> = ({
	show,
	onClose,
	choicesToGaugeAddress,
}) => {
	function doClose() {
		setStep(0)
		onClose()
	}

	const [step, setStep] = useState(0)

	return (
		<Modal size="lg" show={show} onClose={doClose}>
			<Modal.Header>Add a Bribe</Modal.Header>

			{step === 0 ? (
				<>
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
					<Modal.Body>
						<div className="">
							<form className="flex flex-col gap-4">
								<div className="mb-2">
									<div className="mb-2 block">
										<Label htmlFor="gaugeAddress" value="Gauge to bribe" />
									</div>
									<Select id="gaugeAddress" required={true}>
										{Object.entries(choicesToGaugeAddress).map(function ([name, addr]) {
											return <option value={addr.toString()}>{name}</option>
										})}
									</Select>
								</div>
								<div className="mb-2">
									<div className="mb-2 block">
										<Label htmlFor="tokenAddress" value="Bribe token address (Polygon)" />
									</div>
									<TextInput id="tokenAddress" type="text" placeholder="0x" required={true} />
								</div>
								<div>
									<div className="mb-2 block">
										<Label htmlFor="bribeAmount" value="Bribe amount" />
									</div>
									<TextInput id="bribeAmount" type="text" placeholder="100.00" required={true} />
								</div>
							</form>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Button
							className="grow text-center"
							size="xl"
							onClick={() => {
								setStep(2)
							}}
						>
							Continue
						</Button>
					</Modal.Footer>
				</>
			) : (
				''
			)}
		</Modal>
	)
}

export default BribeModal
