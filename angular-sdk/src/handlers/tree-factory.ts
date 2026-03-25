import {BehaviorSubject, of, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {ArrayUtils} from '@algonomia/ts-shared';

export interface IAlgoNavBranch<ID, L> {
    branch: ID[];
    leafs?: L[];
}

export interface IAlgoNavSubTree<ID, L> {
    node?: ID;
    title: string;
    unique_id: string;
    children_nodes: IAlgoNavSubTree<ID, L>[];
    leafs: L[];
    isRoot: boolean;
    n_sub_leafs: number;
    branch: ID[];
    deepness: number;
}

export type ITreeDisplayItem<ID, L> = {
    type: 'node';
    node: IAlgoNavSubTree<ID, L>;
    title: string;
    deepness: number;
    isOpen: boolean;
    hasChildren: boolean;
    subLeafs: L[];
} | {
    type: 'leaf';
    leaf: L;
    node: IAlgoNavSubTree<ID, L>;
    deepness: number;
}

export class AlgoTreeFactory<ID, L> {
    private _branches: IAlgoNavBranch<ID, L>[] = [];
    private _navTree$ = new BehaviorSubject<IAlgoNavSubTree<ID, L> | undefined>(undefined);
    private _selectedBranch = new BehaviorSubject<ID[] | undefined>(undefined);
    private _openedNodeIds$ = new BehaviorSubject<Set<string>>(new Set<string>(['0']));

    constructor(private _idToTitleCallback: ((id: ID) => string) = ((id: ID) => String(id)), branches?: IAlgoNavBranch<ID, L>[]) {
        if (branches) {
            this.branches = branches;
        }
    }

    set branches(branches: IAlgoNavBranch<ID, L>[]) {
        this._branches = branches ?? [];
        this._updateNavTree();
        this._updateSelectedBranch();
    }

    private _updateNavTree() {
        const navTree = this._constructTree();
        this._navTree$.next(navTree);
    }

    private _constructTree() {
        return this._recursive_constructSubTree(
            undefined, '0', 0, this._branches?.filter(x => (x?.leafs?.length ?? 0) > 0) ?? [], [], ''
        );
    }

    private _recursive_constructSubTree(node: ID | undefined, unique_id: string, deepness: number, remaining_branches: IAlgoNavBranch<ID, L>[], branch: ID[] = [], title: string): IAlgoNavSubTree<ID, L> {
        const next_splits = ArrayUtils.flattenUniques(
            remaining_branches.filter(x => x.branch.length > deepness).map(x => x.branch[deepness])
        );
        const unique_splits = ArrayUtils.uniques(next_splits);
        const leafs = ArrayUtils.flattenUniques(
            remaining_branches.filter(x => x.branch.length <= deepness).map(x => x.leafs ?? [])
        );
        const children_nodes = unique_splits.map((split, i) => {
            const next_remaining_branches = remaining_branches.filter(x => split === x.branch[deepness]);
            const next_deepness = deepness + 1;
            const next_branch = [...branch, split];
            const next_unique_id = this._nextUniqueId(unique_id, i);
            return this._recursive_constructSubTree(split, next_unique_id, next_deepness, next_remaining_branches, next_branch, this._idToTitleCallback(split));
        });
        let n_sub_leafs = leafs.length + children_nodes.reduce((a, b) => a + b.n_sub_leafs, 0);
        return {
            node: node, unique_id: unique_id, children_nodes: children_nodes, leafs: leafs, title: title,
            isRoot: deepness === 0, n_sub_leafs: n_sub_leafs, branch: branch, deepness: deepness
        };
    }

    private _nextUniqueId(unique_id: string, next_position: number) {
        return unique_id + ' - ' + next_position;
    }

    get selectedBranch$() {
        return this._selectedBranch.asObservable();
    }

    get selectedBranch() {
        return this._selectedBranch.getValue() ?? [];
    }

    set selectedBranch(branch) {
        this._selectedBranch.next(branch);
    }

    get visibleBranches$() {
        return this._navTree$.pipe(
            switchMap(navTree => {
                if (!navTree) {
                    return of([]);
                }
                return this._openedNodeIds$.pipe(map(opened => {
                    return this._flattenTree(navTree, opened)
                }));
            })
        );
    }

    private _flattenTree(node: IAlgoNavSubTree<ID, L>, openedIds: Set<string>): ITreeDisplayItem<ID, L>[] {
        const items: ITreeDisplayItem<ID, L>[] = [];

        const nodeItem: ITreeDisplayItem<ID, L> = {
            type: 'node',
            title: node.title,
            node: node,
            deepness: node.deepness,
            isOpen: openedIds.has(node.unique_id),
            hasChildren: node.children_nodes.length > 0 || node.leafs.length > 0,
            subLeafs: [...(node.leafs ?? [])]
        };
        if (!node.isRoot) {
            items.push(nodeItem);
        }

        if (node.isRoot || openedIds.has(node.unique_id)) {
            for (const childNode of node.children_nodes) {
                const subNodes = this._flattenTree(childNode, openedIds);
                items.push(...subNodes);
                subNodes.forEach(x => {
                    if (x.type === 'node') {
                        nodeItem.subLeafs?.push(...x.subLeafs);
                    }
                });
            }

            for (const leaf of node.leafs) {
                items.push({
                    type: 'leaf',
                    leaf: leaf,
                    node: node,
                    deepness: node.deepness + 1
                });
            }
        }

        return items;
    }

    openCloseNode(node: IAlgoNavSubTree<ID, L>) {
        const openedNodeIds = this._openedNodeIds$.getValue();
        if (openedNodeIds.has(node.unique_id)) {
            openedNodeIds.delete(node.unique_id);
        } else {
            openedNodeIds.add(node.unique_id);
        }
        this._openedNodeIds$.next(new Set(openedNodeIds));
    }

    forceOpenState(nodeLeafs: L[]) {
        const navTree = this._navTree$.getValue();
        if (!navTree) {
            this._openedNodeIds$.next(new Set());
            return;
        }

        const nodesToOpen = new Set<string>();
        this._dfsCollectParentNodes(navTree, nodeLeafs, nodesToOpen);

        this._openedNodeIds$.next(nodesToOpen);
    }

    private _dfsCollectParentNodes(
        node: IAlgoNavSubTree<ID, L>,
        targetLeafs: L[],
        nodesToOpen: Set<string>
    ): boolean {
        const hasTargetLeafs = node.leafs.some(leaf => targetLeafs.includes(leaf));
        let childHasTargetLeafs = false;
        for (const child of node.children_nodes) {
            const childContainsTarget = this._dfsCollectParentNodes(child, targetLeafs, nodesToOpen);
            if (childContainsTarget) {
                childHasTargetLeafs = true;
            }
        }
        const containsTargetLeafs = hasTargetLeafs || childHasTargetLeafs;
        if (containsTargetLeafs && !node.isRoot) {
            nodesToOpen.add(node.unique_id);
        }
        return containsTargetLeafs;
    }

    isOpen(node: IAlgoNavSubTree<ID, L>) {
        return this._openedNodeIds$.getValue().has(node.unique_id);
    }

    get navTree$() {
        return this._navTree$.asObservable();
    }

    get navTree(): IAlgoNavSubTree<ID, L> | undefined {
        return this._navTree$.getValue();
    }

    get selectedLeafs$() {
        return this._selectedBranch.pipe(map(selectedBranch => {
            const sub_branches = this._branches.filter(
                branch => branch?.branch?.length >= (selectedBranch?.length ?? 0) && selectedBranch?.every((n, i) => n === branch?.branch[i])
            )
            const leafss = sub_branches.map(x => x?.leafs ?? []);
            return leafss.flat();
        }));
    }

    private _updateSelectedBranch() {
        const selectedBranch = [...this.selectedBranch];
        while (selectedBranch.length > 0) {
            const findSelectedBranch = this._branches.find(branch => {
                const _branch = branch?.branch ?? [];
                return selectedBranch.every((x, i) => x === _branch[i])
            });
            if (findSelectedBranch) {
                break;
            } else {
                selectedBranch.splice(selectedBranch.length - 1, 1);
            }
        }
        this.selectedBranch = selectedBranch;
    }
}

