const initialState = {
	nav: {
		currentStep: 0,
		steps: ["network", "rpc", "strategy", "tokens"],
	},
	config: {
		network: "",
	},
};

const reducer = (state, action) => {
	switch (action.type) {
		case "NEXT_STEP":
			return {
				...state,
				nav: {
					...state.nav,
					currentStep: state.nav.currentStep + 1,
				},
			};
		case "PREV_STEP":
			return {
				...state,
				nav: {
					...state.nav,
					currentStep: state.nav.currentStep - 1,
				},
			};
		case "CONFIG_SET":
			return {
				...state,
				config: {
					...state.config,
					[action.key]: action.value,
				},
			};

		default:
			return state;
	}
};

module.exports = {
	initialState,
	reducer,
};