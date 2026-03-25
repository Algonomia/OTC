import {ISourceId, ISourceProvenance, ISourceProvenanceExt} from '../provenance';
import {ISourceType} from '../create-source/source-type';
import {TSourceAnalysisParams, ISourceAnalysisParamsExt} from '../analysis';
import {ISourceUserInteraction, ISourceUserInteractionExt} from '../source-user-interaction';
import {ISourceMedium} from '../source-medium';

export type TSourceView = ISourceId & ISourceType & ISourceProvenance & TSourceAnalysisParams & ISourceUserInteraction & ISourceMedium;
export type TSourceViewExt = ISourceId & ISourceType & ISourceProvenanceExt & ISourceAnalysisParamsExt & ISourceUserInteractionExt & ISourceMedium;
