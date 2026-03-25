import { Injectable } from "@nestjs/common";
import { ESourceStatus } from "@otc/domain";
import { GoogleSafeBrowsingApiService } from "../../../../external-api/url-safety/google-safe-browsing-api.service";
import { UrlService } from "../../../../external-api/url-safety/url.service";
import { KnexDatabaseProvider } from "../../../../utils/database/knex";
import { SourceValidationService } from '../../database/source-validation/source-validation.service';
import { CronjobItemResult } from "../../../../utils/monitoring/logger/logger.decorator";
import { SourceCronjob } from "../source-cronjob.decorator";;

export type SourceLink = {
    id: number;
    link: string;
}

@Injectable()
export class SafeBrowsingService {
    constructor(
        private readonly _knexDatabaseProvider: KnexDatabaseProvider,
        private readonly _googleSafeBrowsingApiService: GoogleSafeBrowsingApiService,
        private readonly _sourceValidationService: SourceValidationService
    ) {}

    @SourceCronjob('Safe Browsing')
    async callUrlScanOnSource(): Promise<CronjobItemResult[]> {
        const sources = await this._getSourcesToScan();

        const { dnsValidSources, dnsInvalidSources } = await this._checkSourceDns(sources);
        await this._sourceValidationService.rejectSources(dnsInvalidSources.map(x => x.id), ESourceStatus.RejectedUrl);

        const { safeUrlSources, unsafeUrlSources } = await this._checkSourceUrlSafety(dnsValidSources);
        await Promise.all([
            this._sourceValidationService.rejectSources(unsafeUrlSources.map(x => x.id), ESourceStatus.RejectedUrl),
            this._sourceValidationService.updateSourceStatuses([...safeUrlSources].map(x => x.id))
        ]);

        return sources.map(source => ({
            sourceId: source.id,
            success: safeUrlSources.some(s => s.id === source.id)
        }));
    }

    private _getSourcesToScan(): Promise<SourceLink[]> {
        return this._knexDatabaseProvider.knex('source')
            .select('source.id', 'source.link')
            .where({
                'status': ESourceStatus.WaitForUrlSafeBrowsingCheck,
                'source_type': 'URL'
            }).whereNotNull('link');
    }

    private async _checkSourceDns(sources: SourceLink[]) {
        const dnsValidSources: SourceLink[] = [];
        const dnsInvalidSources: SourceLink[] = [];

        await Promise.all(sources.map(async source => {
            const isValid = await UrlService.isDnsValid(source.link!);
            if (isValid) {
                dnsValidSources.push(source);
            } else {
                dnsInvalidSources.push(source);
            }
        }));

        return { dnsValidSources, dnsInvalidSources };
    }

    private async _checkSourceUrlSafety(sources: SourceLink[]) {
        const sourceUrls = sources.map(s => s.link);
        const unsafeUrls = await this._googleSafeBrowsingApiService.getUnsafeUrls(sourceUrls);

        const safeUrlSources: SourceLink[] = [];
        const unsafeUrlSources: SourceLink[] = [];

        sources.forEach(source => {
            if (unsafeUrls.includes(source.link)) {
                unsafeUrlSources.push(source);
            } else {
                safeUrlSources.push(source);
            }
        });

        return { safeUrlSources, unsafeUrlSources };
    }
}
