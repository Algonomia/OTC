import { fileStoragePath } from "../common/paths";

interface DiskInfo {
    filesystem: string;
    size: string;
    used: string;
    available: string;
    usePercentage: string;
}

export function diskInfo(): DiskInfo {
    const {execSync} = require('child_process');

    try {
        const dfOutput = execSync(`df -h "${fileStoragePath}"`, {encoding: 'utf8'});
        const lines = dfOutput.split('\n');
        const [filesystem, size, used, available, usePercentage] = lines[1].split(/\s+/);

        return {filesystem, size, used, available, usePercentage};
    } catch (e: any) {
        console.error('Error fetching disk usage:', e);
        throw e;
    }
}
