'use strict';

import { ErrorsNames } from '../errors';

export const nullish = (value: object) => {
	return {
		get() {
			return value;
		},
		set() {
			const error = new TypeError(ErrorsNames.TYPE_MISMATCH);
			throw error;
		}
	}
};