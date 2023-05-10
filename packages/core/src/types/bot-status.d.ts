export type BotStatus =
	| "bot:idle"
	| "bot:running"
	| "bot:stop"
	| "bot:stopping"
	| "bot:stopped"
	| "bot:error"
	| "bot:initializing"
	| "bot:initialized"
	| "bot:scheduled"
	| "bot:launched"
	| "bot:finished"
	| "strategies:validating"
	| "strategies:initializing"
	| "strategies:initialized"
	| "strategies:running"
	| "strategies:stopped"
	| "strategies:error"
	| "aggregators:initializing"
	| "aggregators:initialized"
	| "aggregators:error"
	| "aggregator:computingRoutes"
	| "aggregator:computingRoutesTimeout"
	| "aggregator:computingRoutesError"
	| "aggregator:computingRoutesSuccess"
	| "aggregator:execute:start"
	| "aggregator:execute:executing"
	| "wallets:loading"
	| "wallets:loaded"
	| "wallets:validating"
	| "wallets:validated"
	| "wallets:error"
	| "listeners:loading"
	| "listeners:loaded"
	| "limiters:initializing"
	| "limiters:initialized"
	| "limiters:error"
	| "history:newEntry"
	| "history:updatedEntry"
	| "history:successfulTx"
	| "history:failedTx"
	| "execute:recentRoute"
	| "execute:shouldExecute"
	| "sadWallet"
	| "!shutdown";
