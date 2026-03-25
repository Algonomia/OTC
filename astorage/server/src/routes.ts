import { Application, Request, Response } from 'express';
import healthRouter from './health/routes';
import metadataRouter from './metadata/routes';
import downloadRouter from './donwload/routes';
import uploadRouter from './upload/routes';

export default function setupRoutes(app: Application): void {
    app.get('/ping', (_: Request, res: Response) => {
        res.send('pong');
    });

    app.use('', healthRouter);
    app.use('', metadataRouter);
    app.use('', downloadRouter);
    app.use('', uploadRouter);
}
