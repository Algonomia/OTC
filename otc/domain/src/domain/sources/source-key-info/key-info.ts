import {ISourceId, ISourceProvenance, ISourceProvenanceExt} from '../provenance';
import {ISourceMedium, ISourceMediumRef} from '../source-medium';

export type TSourceKeyInfoRefs = ISourceId & ISourceProvenance & ISourceMediumRef;
export type TSourceKeyInfo = ISourceId & ISourceProvenance & ISourceMedium;
export type TSourceKeyInfoExt = ISourceId & ISourceProvenanceExt & ISourceMedium;
