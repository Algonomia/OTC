import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { EIndicatorId, EObligationTypeId } from '@otc/domain';
import axios from 'axios';

export interface AiSourceData {
    source_id: number;
    jurisdictions: string[];
    obligations_type_ids: EObligationTypeId[];
    indicators_ids: EIndicatorId[];
    file_paths: string[];
}

export interface AiOutputValues {
    source_id: number;
    jurisdiction: string;
    obligation_type_id: EObligationTypeId;
    key: EIndicatorId;
    value?: any;
    notes?: string;
    references?: string;
    additional_values?: any;
    tag_notes?: string;
    llm_evaluation_score: number;
    llm_evaluation_reasoning: string;
    version: string;
}

export enum AiJobStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
};

export interface AiJob {
    job_id: string;
    status: AiJobStatus;
    values: AiOutputValues[];
    error?: string;
    retry_after?: string;
}

@Injectable()
export class OTCAiApiService {
    private readonly _aiServiceUrl: string;
    private readonly _pipelineRunUrl: string;
    private readonly _pipelineJobUrl: string;

    constructor(private readonly _configService: ConfigService) {
        this._aiServiceUrl = this._configService.get<string>('AI_ENDPOINT_URL') || 'http://localhost:8090';
        this._pipelineRunUrl = `${this._aiServiceUrl}/pipeline/run`;
        this._pipelineJobUrl = `${this._aiServiceUrl}/pipeline/job`;
    }

    async startPipeline(sourceData: AiSourceData): Promise<string> {
        try {
            const response = await axios.post<{ job_id: string }>(this._pipelineRunUrl, sourceData);
            return response.data.job_id;
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                throw new HttpException(
                    `AiApiService: ${error.response.statusText || error.message}`,
                    error.response.status
                );
            }
            throw error;
        }
    }

    async getJob(jobId: string): Promise<AiJob> {
        try {
            const response = await axios.get<AiJob>(`${this._pipelineJobUrl}/${jobId}`);
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                throw new HttpException(
                    `AiApiService: ${error.response.statusText || error.message}`,
                    error.response.status
                );
            }
            throw error;
        }
    }
}
