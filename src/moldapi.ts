import { Request, Response } from 'express'
import { Demon, Level, PrismaClient, User } from '../generated/prisma';
import { equal } from 'assert';
import { Types } from '../generated/prisma/runtime/library';

export const db = new PrismaClient();

export async function placeLevel(req: Request, res: Response){
    console.log('placing a new level...');

    req.accepts([
        'application/json',
        'json'
    ]);

    const requestform = req.body;
    console.log(requestform);

    var userid = await requestform.userid as number;
    var discordid = await requestform.discordid as string;
    var levelid = await requestform.levelid as string;
    var title = await requestform.title as string;
    var placement = await requestform.placement as number;
    var video = await requestform.video as string;
    var author = await requestform.author as string;
    var difficulty = await requestform.difficulty as string;

    if (!userid && !discordid) res.status(400).send('Please provide a userid or discord id');
    else if (!levelid) res.status(400).send('level id required');
    else if (!title) res.status(400).send('level title required');
    else if (!placement) res.status(400).send('placement required');

    else { // if (discordid){ 
        if (discordid) {
            userid = (await db.user.findFirst({
                where: {
                    discordid: discordid
                }
            }) as User).id;
        }

        await db.$transaction([
            db.level.updateMany({
                where: {
                    place: {
                        gte: placement
                    }
                },
                data: {
                    place: {
                        increment: 1
                    }
                }
            }),
            db.level.create({
                data: {
                    id: Number.parseInt(levelid),
                    title: title as string,
                    place: placement,
                    video: video,
                    author: author,
                    difficulty: difficulty as Demon,
                    completions: {
                        connect: {
                            id: userid
                        }
                    }
                }
            })
        ]);
        res.status(201).send('Successfully added level to MOLD');
    }
}

export async function moldUpdateLevel(req: Request, res: Response){
    const requestform = await req.body;
    console.log(requestform + 'level update');

    if(!requestform.levelid){
        res.status(400).send('Please provide a levelid');
        return;
    }

    try{
        await db.level.update({
            where: {
                id: requestform.levelid
            },
            data: {
                title: requestform.title,
                author: requestform.author,
                difficulty: requestform.difficulty,
                video: requestform.video
            }
        });
    }
    catch{
        res.status(400).send('Level Update unsuccessful. Was the ID valid?');
        return;
    }
    res.status(201).send(`Level updated successfully`);
}

export async function completeLevel(req: Request, res: Response){
    const requestform = await req.body;
    console.log(requestform);
    
    var userid = requestform.userid;
    var discordid = requestform.discordid;
    var reqlevelid = requestform.levelid;
    var reqleveltitle = requestform.title;

    var discorduser;

    if (!userid && !discordid) res.status(400).send('Please provide a userid or discord id');
    else if (!reqlevelid && !reqleveltitle) res.status(400).send('level id or title required');


    else { 
        if(discordid){
            userid = (await db.user.findFirst({
                where: {
                    discordid: discordid
                }
            }) as User).id;
        }
        if(reqleveltitle){
            reqlevelid = (await db.level.findFirst({
                where : {
                    title: reqleveltitle
                }
            }) as Level).id;
        }
        await db.level.update({
            where: { id: reqlevelid},
            data: { completions: {
                connect: {
                    id: userid
                },
            }},
        });
        res.status(200).send('Successfully added user to completions');
    }
}

export async function moveLevel(req: Request, res: Response){
    console.log('moving level');
    const requestform = await req.body;
    
    var levelid = await requestform.levelid;
    var leveltitle = await requestform.title;
    var placement = await requestform.placement;
    var oldplace;

    if(leveltitle){
        try{
            levelid = (await db.level.findFirst({
                where : {
                    title: leveltitle
                }
            }) as Level).id;
        }
        catch(error: any){
            res.status(400).send('Bad title!');
            return;
        }
    }


    if (!levelid) {res.status(400).send('No level id and no title'); return;}
    else {
        oldplace = (await db.level.findFirst({
            where: {
                id: levelid
            }
        }) as Level).place;
    }
    if (!placement || placement < 1){ res.status(400).send('bad or absent placement'); return; }

    else{ 
        if(oldplace > placement){
            await db.$transaction([db.level.updateMany({
                    where: {
                        place: {
                            gte: placement,
                            lt: oldplace
                        }
                    },
                    data: {
                        place: {
                            increment: 1
                        }
                    }
                }),
                db.level.update({
                    where: {
                        id: levelid
                    },
                    data: {
                        place: placement
                    }
                })
            ]);
        }
        else if(placement > oldplace){
            await db.$transaction([db.level.updateMany({
                    where: {
                        place: {
                            lte: placement,
                            gt: oldplace
                        }
                    },
                    data: {
                        place: {
                            decrement: 1
                        }
                    }
                }),
                db.level.update({
                    where: {
                        id: levelid
                    },
                    data: {
                        place: placement
                    }
                })
            ]);
        }
        else{
            res.send('No movement!');
        }
    res.status(200).send(`${leveltitle? leveltitle : levelid} moved to ${placement}`);
    }
}

export async function registerUser(req: Request, res: Response){
    console.log('Resitering a new user');

    const requestform = await req.body;

    const discordid = requestform.discordid;
    const uname = requestform.uname;
    const passhash = requestform.passhash;

    const checkUser = (await db.user.findFirst({
        where: {
            discordid: discordid
        }
    }) as User);
    if(!checkUser){
        if(!discordid && !uname) {res.status(400).send('I need an indetifier to add a user!'); return;}
        else if(uname && !passhash && !discordid) {res.status(400).send('I need a password hash to store with this user'); return;}
        else res.status(202);

        await db.user.create({
            data : {
                discordid: discordid,
                name: uname,
                passHash: passhash
            }
        }).catch((error) =>{ 
            res.status(400).send('failed to add user to MOLD. Sorry');
            return;
        });
        res.status(201).send(`successfully added ${uname} as a user to the MOLD`);
    }
    else{
        res.status(200).send(`${uname} is already a member of the mold`);
    }
}

// GET requests

export async function levelBoard(req: Request, res: Response){
    console.log('fetching levelboard');

    const entries = req.headers['entries'] as string;
    var parsedentries = Number.parseInt(entries);
    console.log(req.headers);
    if(!parsedentries) parsedentries = await db.level.count();

    const levels = (await db.level.findMany({
        orderBy: {
            place: "asc"
        },
        include: {
            completions: true
        },
        take: parsedentries
    }) as Level[]);

    if(!levels){
        res.status(400).send('bad number of entries');
        return;
    }

    res.status(200).send(JSON.stringify(levels));
}

export async function authenticateUser(req: Request, res: Response){
    console.log('authenticating user');

    const uname = req.query['uname'];
    const passHash = req.query['password'];
    const token = req.query['token'];

    if(!uname) {res.status(400).send('{ auth: false }'); return;}
    else if(!passHash && !token) {res.status(400).send('{ auth: false }'); return;}

    if(passHash){
        await db.user.findFirstOrThrow({
            where : {
                passHash: passHash as string,
                name: uname as string
            },
        }).then((user: User) => {
            res.status(200).send(`{ auth: true, message: "authenticated ${uname} successfully"}`);
        }).catch((error) => {
            res.status(400).send(`{ auth: false, message: "${error.message}"}`);
        });
    }

    else{
        await db.user.findFirstOrThrow({
            where : {
                passHash: token as string,
                name: uname as string
            },
        }).then((user: User) => {
            res.status(200).send(`{ auth: true, message: "authenticated ${uname} successfully"}`);
        }).catch((error) => {
            res.status(400).send(`{ auth: false, message: "${error.message}"}`);
        });
    }
}

