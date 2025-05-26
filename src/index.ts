import { Request, Response } from 'express';
import express from 'express';
import { db, placeLevel, completeLevel, moveLevel, levelBoard, registerUser, moldUpdateLevel, authenticateUser } from './moldapi';
import { updateFromGDDL } from './externalapi/gddl';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/levelboard', (req, res) => {levelBoard(req, res);});
app.get('/', (req: Request, res: Response) =>{
    res.send('Hello, Website currently in progress. Please use the discord bot for now :)');
});

app.use('/api', async function(req: Request, res: Response, next){
    var key = req.headers['api-key'];
  
    // key isn't present
    if (!key) return next((res: Response) => {res.status(418).send('key required'); return;});

    const authapikey = await db.apiKey.findFirst({
        where: { key: key as string }
    });

    if (!authapikey) return next((res: Response) => {res.status(401).send('invalid api key');});
    
    next();
});

app.post('/api/placelevel', (req, res) => {placeLevel(req, res);});
app.post('/api/completelevel', (req, res) => {completeLevel(req, res);});
app.post('/api/movelevel', (req, res) => {moveLevel(req, res);});
app.post('/api/registeruser', (req, res) => {registerUser(req, res);});
app.post('/api/updatelevel', (req, res) => {moldUpdateLevel(req, res);});
app.post('/api/authenticate', (req, res) => {authenticateUser(req, res)});



async function main() {
    // const levels = await readJsonFile('./temp_data/mold.json');
    // for(const level of levels){
    //     await createWithID(level.ID, level.Placement);
    //     await sleep(1000);
    // }
    app.listen(port, () => {
        console.log(`Mold API listening on port ${port}`);
        setInterval(updateFromGDDL, 1000 * 60 * 10);
    });
}

main()
    .then(async () => db.$disconnect)
    .catch(async (e) => {
        console.error(e);
        await db.$disconnect();
        process.exit(1);
    });

