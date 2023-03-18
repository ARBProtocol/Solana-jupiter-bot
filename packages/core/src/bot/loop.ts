import { logger } from "../logger";
import { Bot } from "./bot";

export const loop = async (
	bot: Omit<Bot, "loadPlugin">,
	strategy: () => Promise<void>,
	{ iterations }: { iterations?: number } = {}
) => {
	const onComputeRoutesError = async () => {
		logger.info("🔥 onComputeRoutesError FROM SUBSCRIBER <----------------");

		logger.info(
			`No best route found, backOff for ${
				bot.store.getState().bot.backOff.ms / 1000
			} seconds`
		);
		await bot.backOff();
	};

	bot.onStatus("routesError", onComputeRoutesError);

	let condition = true;
	while (condition) {
		// if bot is busy, wait
		const status = bot.getStatus();
		if (status !== "idle") {
			await bot.utils.sleep(500);
			continue;
		}

		try {
			await strategy();
		} catch (e) {
			logger.error(e, "error in strategy");
		}

		if (iterations) {
			iterations--;
			if (iterations === 0) {
				condition = false;
			}
		}
	}
};
