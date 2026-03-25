export namespace StringUtils {
    export function cropText(text: string, maxLength = 60, trailing = '...') {
        return text?.length > maxLength ? text.slice(0, maxLength) + trailing : text;
    }

    export function cropTextMiddle(text: string, maxLength = 60, trailing = '...') {
        if ((text?.length - trailing.length) <= maxLength) {
            return { cropped_text: text, is_cropped: false };
        }
        const text_sliced: string = sliceTextMiddle(text, maxLength, trailing);
        return { cropped_text: text_sliced, is_cropped: true };
    }

    export function sliceTextMiddle(text: string, maxLength = 60, trailing = '...'): string {
        const text_1: string = text.slice(0, Math.floor(maxLength / 2));
        const text_2: string = text.slice(text.length - Math.floor(maxLength / 2 + 1));
        return text_1 + trailing + text_2;
    }
}
