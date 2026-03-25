import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import setupRoutes from './routes';

const app: Application = express();

const allowedOrigin: string = process.env.CORS_ORIGIN || 'http://localhost:3000';
const port: number = parseInt(process.env.PORT || '3001', 10);

app.use(cors({
    origin: allowedOrigin,
    // credentials: true
}));

app.use(express.static('public'));
app.use(bodyParser.urlencoded());

app.use(bodyParser.json());

setupRoutes(app);

app.listen(port, (err) => {
    if (err) {
        console.error(`Error starting server: ${err.message}`);
        return;
    }
    console.log(`File microservice listening on port ${port}`);
});

export default app;