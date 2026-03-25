import { Request, Response } from "express";
import { diskInfo } from "../composites/hardware/disk";
import { serverInfo } from "../composites/hardware/server";

export function healthStatus(_: Request, res: Response) {
    const timestamp = new Date().toISOString();
    try {
        const disk = diskInfo();
        const server = serverInfo();
        const status = 'healthy';
        res.json({status, timestamp, disk, server});
    } catch (e: any) {
        console.error('Health check failed:', e);
        const error = e.message;
        const status = 'unhealthy';
        res.status(500).json({status, timestamp, error});
    }
}
