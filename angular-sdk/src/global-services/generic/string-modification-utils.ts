export class StringModificationUtils {
    /** trimStringBeforeExpression('abcd@efg', '@') ----> 'efg' */
    static trimStringBeforeExpression = (str: string, expr: string): string | null => {
        const res = str.match(`(?<=${expr}).*$`);
        if (!res) {
            return null;
        }
        return res[0];
    }
}