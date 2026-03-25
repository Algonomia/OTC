import {
    TDatumFullContributionView,
    IDatumContributionView,
    TDatumFullContributionViewExt
} from './contribution-view';
import {OrganizationType} from '../../sources/organization-type/organization-type';
import {ArrayUtils, DateUtils} from '@algonomia/ts-shared';
import {TSourceKeyInfo} from '../../sources/source-key-info/key-info';
import {TOTCSegmentSource} from '../../segmentations/interface';

export namespace CreateOtcFullContributionView {
    export function toFront(fullLines: TDatumFullContributionView[]): TDatumFullContributionViewExt[] {
        return fullLines.map(x => ({
            ...x,
            organization_type: OrganizationType.getById(x.organization_type_id) as OrganizationType | undefined,
            date_of_publication: DateUtils.convertMsTimestampToDate(x.date_of_publication)
        }));
    }

    export function fuse(sources: TSourceKeyInfo[], contributionViews: IDatumContributionView[]): TDatumFullContributionView[] {
        const orderedSources = [...sources].sort((x, y) => x.source_id - y.source_id);
        const orderedValueLines = ArrayUtils.convertThenSortWithArrays(contributionViews, _toId);
        const fusedLines = orderedValueLines.map(contributionView => {
            const source = _findSource(contributionView, orderedSources);
            return {...source, ...contributionView};
        });
        return ArrayUtils.convertThenSortWithArrays(fusedLines, ((x: IDatumContributionView) => [DateUtils.stdStringToDate(x.version), x.id]), -1);
    }

    function _findSource(valueLine: IDatumContributionView, orderedSources: TSourceKeyInfo[]): TSourceKeyInfo | undefined {
        return ArrayUtils.findWithBinarySearch(
            orderedSources, valueLine.source_id, (x, y) => x.source_id - y
        );
    }

    function _toId(x: TOTCSegmentSource) {
        return [x.source_id, x.jurisdiction, x.obligation_type_id];
    }
}
