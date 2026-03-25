import { AlgoStringValidator } from './string-validator';

describe('AlgoStringValidator', () => {
    describe('required', () => {
        const v = new AlgoStringValidator({ required: true });

        it('should error on empty string', () => {
            const errors = v.checkErrors('');
            expect(errors).toContainEqual({ required: true });
        });

        it('should error on whitespace-only string', () => {
            const errors = v.checkErrors('   ');
            expect(errors).toContainEqual({ required: true });
        });

        it('should pass on non-empty string', () => {
            expect(v.checkErrors('hello')).toEqual([]);
        });
    });

    describe('minLength / maxLength', () => {
        const v = new AlgoStringValidator({ minLength: 3, maxLength: 10 });

        it('should error when string is too short', () => {
            const errors = v.checkErrors('ab');
            expect(errors).toContainEqual({
                minlength: { requiredLength: 3, actualLength: 2 },
            });
        });

        it('should error when string is too long', () => {
            const errors = v.checkErrors('a'.repeat(11));
            expect(errors).toContainEqual({
                maxlength: { requiredLength: 10, actualLength: 11 },
            });
        });

        it('should pass when length is within bounds', () => {
            expect(v.checkErrors('hello')).toEqual([]);
        });

        it('should skip length checks on null/undefined (not required)', () => {
            expect(v.checkErrors(null)).toEqual([]);
            expect(v.checkErrors(undefined)).toEqual([]);
        });
    });

    describe('URL validation', () => {
        const v = new AlgoStringValidator({ isUrl: true });

        it('should accept valid https URLs', () => {
            expect(v.checkErrors('https://example.com')).toEqual([]);
        });

        it('should auto-prepend https:// and accept bare domains', () => {
            expect(v.checkErrors('example.com')).toEqual([]);
        });

        it('should reject non-http protocols', () => {
            const errors = v.checkErrors('ftp://example.com');
            expect(errors).toContainEqual({ wrongUrl: true });
        });

        it('should reject completely invalid URLs', () => {
            const errors = v.checkErrors('not a url at all !!!');
            expect(errors).toContainEqual({ wrongUrl: true });
        });

        it('should reject private IP addresses (SSRF protection)', () => {
            expect(v.checkErrors('http://127.0.0.1')).toContainEqual({ wrongUrl: true });
            expect(v.checkErrors('http://10.0.0.1')).toContainEqual({ wrongUrl: true });
            expect(v.checkErrors('http://192.168.1.1')).toContainEqual({ wrongUrl: true });
            expect(v.checkErrors('http://172.16.0.1')).toContainEqual({ wrongUrl: true });
        });

        it('should allow empty/null values (not required)', () => {
            expect(v.checkErrors('')).toEqual([]);
            expect(v.checkErrors(null)).toEqual([]);
        });
    });

    describe('email validation', () => {
        const v = new AlgoStringValidator({ isEmail: true });

        it('should accept valid emails', () => {
            expect(v.checkErrors('user@example.com')).toEqual([]);
        });

        it('should reject emails without @', () => {
            expect(v.checkErrors('userexample.com')).toContainEqual({ invalidEmail: true });
        });

        it('should reject emails without domain', () => {
            expect(v.checkErrors('user@')).toContainEqual({ invalidEmail: true });
        });
    });

    describe('phone validation', () => {
        const v = new AlgoStringValidator({ isPhone: true });

        it('should accept local format with separators', () => {
            expect(v.checkErrors('01 23 45 67 89')).toEqual([]);
        });

        it('should reject + prefix (digitsOnly check strips separators but not +)', () => {
            expect(v.checkErrors('+33123456789')).toContainEqual({ invalidPhone: true });
        });

        it('should accept digits with dashes', () => {
            expect(v.checkErrors('01-23-45-67-89')).toEqual([]);
        });

        it('should reject strings with letters', () => {
            expect(v.checkErrors('not-a-phone')).toContainEqual({ invalidPhone: true });
        });

        it('should reject too-short numbers', () => {
            expect(v.checkErrors('12345')).toContainEqual({ invalidPhone: true });
        });
    });
});
