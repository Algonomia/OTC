interface ServerInfo {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    version: string;
}

export function serverInfo(): ServerInfo {
    return {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        version: process.version,
    }
}
