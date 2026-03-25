import { applyDecorators } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { SourceCronjobLog } from "../../../utils/monitoring/logger/logger.decorator";
import { PreventConcurrency } from "../../../utils/concurrency/prevent-concurrency.decorator";

const EVERY_2_MINUTES = '0 */2 * * * *';

export function SourceCronjob(jobName: string, cronExpression: string = EVERY_2_MINUTES) {
    return applyDecorators(
        SourceCronjobLog(jobName) as MethodDecorator,
        PreventConcurrency(),
        Cron(cronExpression),
    );
}
