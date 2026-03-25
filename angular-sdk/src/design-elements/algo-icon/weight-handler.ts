import {AlgoListIncrementer} from '../../handlers/list-incrementer';

export type IconWeight = 'Light' | 'Normal' | 'Regular' | 'Medium';

export class AlgoIconWeightHandler extends AlgoListIncrementer<IconWeight> {
    static weightList: IconWeight[] = ['Light', 'Normal', 'Regular', 'Medium'];

    constructor(weight: IconWeight = AlgoIconWeightHandler.weightList[0], disabled: boolean = false) {
        super(AlgoIconWeightHandler.weightList, weight, disabled);
    }

    set weight(weight: IconWeight) {
        this.listElement = weight;
    }

    get activeWeight() {
        return this.activeListElement;
    }
}
