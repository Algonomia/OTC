import { SelectHandler } from './select-handler';

interface Item {
    id: number;
    name: string;
}

describe('SelectHandler - selection behavior', () => {
    let items: Item[];
    const trackBy = (item: Item) => item.id;

    beforeEach(() => {
        items = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' },
        ];
    });

    it('should keep locked items selected after remove()', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [items[0]], [], trackBy);
        handler.remove(items[0]);
        expect(handler.isSelected(items[0])).toBeTrue();
    });

    it('should keep locked items selected after removeAll()', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [items[0]], [], trackBy);
        handler.removeAll();
        expect(handler.isSelected(items[0])).toBeTrue();
    });

    it('should keep locked items selected after switch()', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [items[0]], [], trackBy);
        handler.switch(items[0]);
        expect(handler.isSelected(items[0])).toBeTrue();
    });

    it('should keep locked items selected after switchSome()', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [items[0]], [], trackBy);
        handler.switchSome([items[1], items[2]]);
        expect(handler.isSelected(items[0])).toBeTrue();
    });

    it('should keep locked items selected after switchAll()', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [items[0]], [], trackBy);
        handler.switchAll();  // select all
        handler.switchAll();  // deselect all
        expect(handler.isSelected(items[0])).toBeTrue();
    });

    it('should remove selected items not present in the new list', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [], [items[1]], trackBy);
        handler.changeList([items[0], items[2]]);
        expect(handler.isSelected(items[1])).toBeFalse();
    });

    it('should retain selected items present in the new list', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [], [items[1]], trackBy);
        handler.changeList([items[1], items[2]]);
        expect(handler.isSelected(items[1])).toBeTrue();
    });

    it('should remove locked items not present in the new list', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [items[0]], [], trackBy);
        handler.changeList([items[1], items[2]]);
        expect(handler.isLocked(items[0])).toBeFalse();
        expect(handler.isSelected(items[0])).toBeFalse();
    });

    it('should retain locked items present in the new list', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [items[0]], [], trackBy);
        handler.changeList([items[0], items[2]]);
        expect(handler.isLocked(items[0])).toBeTrue();
        expect(handler.isSelected(items[0])).toBeTrue();
    });

    it('should initialize preselected item as selected', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [], [items[1]], trackBy);
        expect(handler.isSelected(items[1])).toBeTrue();
    });

    it('should not auto-select items that are not preselected or locked', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [], [], trackBy);
        expect(handler.isSelected(items[1])).toBeFalse();
    });

    it('should select all items with addAll()', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [], [], trackBy);
        handler.addAll();
        items.forEach(item => {
            expect(handler.isSelected(item)).toBeTrue();
        });
    });

    it('should deselect all non-locked items with removeAll()', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [items[0]], [items[0], items[1], items[2]], trackBy);
        handler.removeAll();
        expect(handler.isSelected(items[0])).toBeTrue();
        expect(handler.isSelected(items[1])).toBeFalse();
        expect(handler.isSelected(items[2])).toBeFalse();
    });

    it('should correctly replace all selected items using replaceAll()', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [], [], trackBy);
        handler.replaceAll([items[1], items[2]]);
        expect(handler.isSelected(items[1])).toBeTrue();
        expect(handler.isSelected(items[2])).toBeTrue();
        expect(handler.isSelected(items[0])).toBeFalse();
    });

    it('should correctly replace some selected items using replaceSome()', () => {
        const handler = SelectHandler.getMultiSelectHandler(items, [], [items[0], items[1]], trackBy);
        handler.replaceSome([items[1]], [items[2]]);
        expect(handler.isSelected(items[0])).toBeTrue();
        expect(handler.isSelected(items[1])).toBeFalse();
        expect(handler.isSelected(items[2])).toBeTrue();
    });
});
