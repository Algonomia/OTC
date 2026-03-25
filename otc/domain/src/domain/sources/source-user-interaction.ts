import {ESourceStatus, SourceStatusExt} from './status/source-status';

export interface ISourceUserInteraction {
    status_id: ESourceStatus;
    proposed_by: string;
    proposed_at: number;
    admin_comment?: string;
    validated_by?: string;
    validated_at?: number;
}

export interface ISourceUserInteractionExt {
    source_id: number;
    status: SourceStatusExt;
    proposed_by: string;
    proposed_at: Date;
    admin_comment?: string;
    validated_by?: string;
    validated_at?: Date;
}
