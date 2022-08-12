'use strict';

import { ErrorsNames } from '../errors';

export const objects = (value: object) => {
	return {
		get() {
			return value;
		},
		set(replacementValue: unknown) {
			if (replacementValue instanceof Object && replacementValue.constructor === value.constructor) {
				value = replacementValue;
				return value;
			}
			const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
			throw error;
		}
	}
};