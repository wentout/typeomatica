'use strict';

import { ErrorsNames } from '../errors';

export const functions = () => {
	throw new TypeError(ErrorsNames.RIP_FUNCTIONS);
};