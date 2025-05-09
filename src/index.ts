import { Request, Response } from 'express';
import express from 'express';
import { db, placeLevel, completeLevel, moveLevel, levelBoard, registerUser } from './moldapi';

const app = express();
const port = 3000;

app.use(express.json());

function error(req: Request, status: number, msg: string) {
    var err = new Error(msg);
    req.statusCode = status;
    return err;
}

app.post('/api/placelevel', (req, res) => {placeLevel(req, res);});
app.post('/api/completelevel', (req, res) => {completeLevel(req, res);});
app.post('/api/movelevel', (req, res) => {moveLevel(req, res);});
app.post('api/registeruser', (res, req) => {registerUser(res, req);});

app.get('/api/levelboard', (req, res) => {levelBoard(req, res);});

app.get('/', (req: Request, res: Response) =>{
    res.send('Hello, Website currently in progress. Please use the discord bot for now :)');
});

app.use('/api', async function(req: Request, res: Response, next){
    var key = req.query['api-key'];
  
    // key isn't present
    if (!key) return next(error(req, 400, 'key required'));

    const authapikey = await db.apiKey.findFirst({
        where: { key: key as string }
    });

    if (!authapikey) return next(error(req, 401, 'invalid api key'));
    
    next();
});

async function main() {
    app.listen(port, () => {
        console.log(`Grinch API listening on port ${port}`);
    });
}

main()
    .then(async () => db.$disconnect)
    .catch(async (e) => {
        console.error(e);
        await db.$disconnect();
        process.exit(1);
    });
