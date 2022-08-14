'use strict';

import { ErrorsNames } from '../errors';

export const special = (value: object) => {
	return {
		get() {
			return value;
		},
		set(replacementValue: object) {
			if (typeof replacementValue === typeof value) {
				value = replacementValue;
				return value;
			}
			const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
			throw error;
		}
	}
};