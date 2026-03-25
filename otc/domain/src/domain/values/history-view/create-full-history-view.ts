import {TDatumFullHistoryView, TDatumFullHistoryViewExt, IDatumHistoryView} from './history-view';
import {OrganizationType} from '../../sources/organization-type/organization-type';
import {ArrayUtils, DateUtils} from '@algonomia/ts-shared';
import {TSourceKeyInfo} from '../../sources/source-key-info/key-info';
import {TOTCSegmentSource} from '../../segmentations/interface';

export namespace CreateOtcFullHistoryView {
    export function toFront(fullLines: TDatumFullHistoryView[]): TDatumFullHistoryViewExt[] {
        return fullLines.map(x => ({
            ...x,
            organization_type: OrganizationType.getById(x.organization_type_id) as OrganizationType | undefined,
            date_of_publication: DateUtils.convertMsTimestampToDate(x.date_of_publication)
        }));
    }

    export function fuse(sources: TSourceKeyInfo[], historyViews: IDatumHistoryView[]): TDatumFullHistoryView[] {
        const orderedSources = [...sources].sort((x, y) => x.source_id - y.source_id);
        const orderedValueLines = ArrayUtils.convertThenSortWithArrays(historyViews, _toId);
        const fusedLines = orderedValueLines.map(historyView => {
            const source = _findSource(historyView, orderedSources);
            return {...source, ...historyView};
        });
        return ArrayUtils.convertThenSortWithArrays(fusedLines, ((x: TDatumFullHistoryView) => [DateUtils.stdStringToDate(x.version), x.type === 'from_user', x.id]), -1);
    }

    function _findSource(valueLine: IDatumHistoryView, orderedSources: TSourceKeyInfo[]): TSourceKeyInfo | undefined {
        return ArrayUtils.findWithBinarySearch(
            orderedSources, valueLine.source_id, (x, y) => x.source_id - y
        );
    }

    function _toId(x: TOTCSegmentSource) {
        return [x.source_id, x.jurisdiction, x.obligation_type_id];
    }
}
