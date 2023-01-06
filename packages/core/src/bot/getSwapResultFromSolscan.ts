import { Event, getTransaction } from "../solscan";
import { Store } from "../store";

import fs from "fs";
import { SwapSuccess } from "../jupiter";

export const getSwapResultFromSolscan = async (
	store: Store,
	swapResult: SwapSuccess
) => {
	const walletAddress = store.getState().wallet.address;

	const { txid: txId } = swapResult;

	const { address: inputAddress } = store.getState().config.tokens.tokenA;
	const { address: outputAddress } = store.getState().config.tokens.tokenB;

	if (!txId || !inputAddress || !outputAddress) {
		console.log(
			"🚀 ~ file: getSwapResultFromSolscan.ts:5 ~ getSwapResultFromSolscan ~ txId, inputAddress, outputAddress",
			txId,
			inputAddress,
			outputAddress
		);
		return { txId: null, inAmount: null, outAmount: null };
	}

	// set swap status to fetchingResults
	store.setState((state) => {
		if (state.tradeHistory.txId) {
			return (state.tradeHistory.txId.status = "fetchingResult");
		}
	});

	console.log(
		"🚀 ~ file: getSwapResultFromSolscan.ts:6 ~ getSwapResultFromSolscan ~ walletAddress",
		walletAddress
	);

	const tx = await getTransaction(txId);

	fs.writeFileSync("./temp/txSolscanResult.json", JSON.stringify(tx, null, 2));

	console.log(
		"🚀 ~ file: getSwapResultFromSolscan.ts:5 ~ getSwapResultFromSolscan ~ tx",
		tx
	);

	if (tx) {
		const result: Event[] = [];

		const inputAddressString = inputAddress.toString();
		console.log(
			"🚀 ~ file: getSwapResultFromSolscan.ts:50 ~ inputAddressString",
			inputAddressString
		);
		const outputAddressString = outputAddress.toString();
		console.log(
			"🚀 ~ file: getSwapResultFromSolscan.ts:52 ~ outputAddressString",
			outputAddressString
		);

		if ("unknownTransfers" in tx) {
			console.log("SOLSCAN - UnknownTransfers found");
			tx.unknownTransfers.forEach((transfer) => {
				const tokenRelatedEvents = transfer.event.filter(({ tokenAddress }) => {
					console.log("SOLSCAN - UnknownTransfers tokenAddress", tokenAddress);
					return (
						tokenAddress === inputAddressString ||
						tokenAddress === outputAddressString
					);
				});

				console.log(
					"🚀 ~ file: getSwapResultFromSolscan.ts:62 ~ tx.unknownTransfers.forEach ~ tokenAddress === inputAddress.toString()",
					inputAddressString,
					outputAddressString
				);
				result.push(...tokenRelatedEvents);
			});
			console.log("SOLSCAN - UnknownTransfers found - DONE", result);
		}

		if ("innerInstructions" in tx && tx.innerInstructions) {
			console.log("SOLSCAN - innerInstructions found");
			tx.innerInstructions.forEach((instruction) => {
				const tokenRelatedEvents = instruction.parsedInstructions.filter(
					(instruction) => {
						const extra = instruction.extra;
						if (extra) {
							const tokenAddress = extra.tokenAddress;
							console.log(
								"SOLSCAN - innerInstructions tokenAddress, inputAddress, outputAddress",
								tokenAddress,
								inputAddressString,
								outputAddressString
							);
							return (
								tokenAddress === inputAddressString ||
								tokenAddress === outputAddressString
							);
						}
					}
				);

				result.push(
					...tokenRelatedEvents.map((instruction) => instruction.extra as Event)
				);
			});

			console.log("SOLSCAN - innerInstructions found - DONE", result);
		}

		console.log("SOLSCAN - result", result);

		if (result.length > 0) {
			const inAmount = Number(
				result.find((event) => event.sourceOwner === walletAddress)?.amount
			);

			console.log(
				"HERE",
				result.find((event) => event.sourceOwner === walletAddress)?.amount
			);

			const outAmount = Number(
				result.find((event) => event.destinationOwner === walletAddress)?.amount
			);

			console.log(
				"HERE",
				result.find((event) => event.destinationOwner === walletAddress)?.amount
			);

			fs.writeFileSync("./temp/txResult.json", JSON.stringify(result, null, 2));
			console.log(
				"🚀 ~ file: getSwapResultFromSolscan.ts:46 ~ tx.unknownTransfers.forEach ~ result",
				result
			);

			// set swap status to success
			store.setState((state) => {
				if (state.tradeHistory.txId) {
					const temp = { ...state.tradeHistory.txId };
					temp.status = "success";
					return temp;
				}
			});

			return {
				txId,
				inAmount,
				outAmount,
			};
		}
	}

	console.error("SOLSCAN - No result found !!!!!!!!!!!!!!!!!!!");

	// set swap status to failed
	store.setState((state) => {
		if (state.tradeHistory.txId) {
			const temp = { ...state.tradeHistory.txId };
			temp.status = "unknown";
			return temp;
		}
	});

	return { txId, inAmount: null, outAmount: null };
};
