import {AlgoDateValidator, ValidatorGroup} from '@algonomia/ts-shared';
import {ICreateAccessToken} from '../../auth/access-token/access-token.interface';

export const createAccessKeyValidatorGroup = new ValidatorGroup<ICreateAccessToken>({
    expires_at: new AlgoDateValidator({ label: 'Date', required: true, minDate: new Date(), with_time: true }),
});
