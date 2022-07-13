const { default: axios } = require("axios");
const promiseRetry = require("promise-retry");
const cache = require("./cache");

const getSwapResultFromSolscanParser = async (txid) => {
	try {
		const fetcher = async (retry) => {
			console.log(
				new Date().toLocaleString(),
				"Waiting for results of: ",
				`https://solscan.io/tx/${txid}`
			);
			const response = await axios.get(`https://api.solscan.io/transaction`, {
				params: {
					tx: txid,
				},
			});

			if (response.status === 200) {
				if (response?.data?.mainActions) {
					return response.data;
				} else {
					retry(new Error("Transaction was not confirmed"));
				}
			}
		};

		const data = await promiseRetry(fetcher, {
			retries: 40,
			minTimeout: 500,
			maxTimeout: 1000,
		});

		const ownerAddress = "AGpEqxiKA6MGR4ZM8eQG2ycHscgjk7jtJxHktxKisTda";
		const tokenAddress = cache?.config?.tokenA.address;

		const mainActions = data.mainActions;

		let [inputAmount, outputAmount] = [-1, -1];
		mainActions.filter((action) => {
			const events = action.data.event;
			const inputEvent = events.find(
				(event) =>
					event?.sourceOwner === ownerAddress &&
					event?.tokenAddress === tokenAddress
			);
			const outputEvent = events.find(
				(event) =>
					event?.destinationOwner === ownerAddress &&
					event?.tokenAddress === tokenAddress
			);

			if (inputEvent) inputAmount = inputEvent?.amount;

			if (outputEvent) outputAmount = outputEvent?.amount;
		});

		return [inputAmount, outputAmount];
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	getSwapResultFromSolscanParser,
};