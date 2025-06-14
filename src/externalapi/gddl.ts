import { Axios } from 'axios'
import { Demon, Level } from '../../generated/prisma';
import { db } from '../moldapi';
import { readJsonFile, updateAllValues, writeJsonFile } from '../updatedb';

export const gddlAPI = new Axios({
    baseURL: "https://gdladder.com/api"
});

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function updateFromGDDL(){
    var levels = (await db.level.findMany());
    
    for (const i of levels) {
        await sleep(1000);
        await updateWithID(i);
    }
    console.log('Updated list from GDDL');
}

export async function updateWithID(i: Level){
    const response = await gddlAPI.get(`/level/${i.id}`, {
        headers : {
            Accept: 'application/json'
        }
    }).then((message) => {
        // console.log(message);
        return message;
    });
    const level = JSON.parse(response.data);
    if(level.Meta.Difficulty == "Official"){ level.Meta.Difficulty = undefined; }
    if(i.video != "https://youtube.com/watch?v=null" || !i.video){
        await db.level.update({
            where : {
                id: i.id
            },
            data: {
                author: level.Meta.Creator,
                difficulty: level.Meta.Difficulty? (level.Meta.Difficulty as string).toUpperCase() as Demon : "MEDIUM",
                video: i.video? i.video : `https://youtube.com/watch?v=${level.Showcase}`
            }
        });
    }
    else{
        await db.level.update({
            where : {
                id: i.id
            },
            data: {
                author: level.Meta.Creator,
                difficulty: (level.Meta.Difficulty as string).toUpperCase() as Demon,
            }
        });
    }
    if(i.video == '' || i.video == 'https://youtube.com/watch?v=null'){
        await db.level.update({
            where: {
                id: i.id
            },
            data: {
                video: null
            }
        });
    }
}

export async function createWithID(id: string, placement: string){
    const response = await gddlAPI.get(`/level/${id}`, {
        headers : {
            Accept: 'application/json'
        }
    }).then((message) => {
        return message;
    });
    const level = JSON.parse(response.data);
    if(level.Meta.Difficulty == 'OFFICIAL') { level.Meta.Difficulty = 'MEDIUM' as Demon; };
    await db.level.create({
        data: {
            id: Number.parseInt(id as string),
            place: Number.parseInt(placement as string),
            title: level.Meta.Name,
            author: level.Meta.Creator? level.Meta.Creator : '',
            difficulty: (level.Meta.Difficulty == 'Official')? "MEDIUM" : level.Meta.Difficulty.toUpperCase(),
            // completions: {
            //     connect: completions
            // },
            video: level.Showcase? `https://youtube.com/watch?v=${level.Showcase}` : ""
        }
    }).then(() => {
        console.log(`success adding ${level.Meta.Name}`);
    });
}

export async function setIDwithName(name: string, creator?: string){
    const response = await gddlAPI.get(`/level/search`, {
        headers : {
            Accept: 'application/json'
        },
        params: {
            name,
            creator: creator? creator : null
        }
    }).then((message) => {
        console.log(message);
        if(message.status != 404){
            return message;
        }
        return { data: {}};
    }).catch((error) => {
        console.log(`could not get level ID with name ${name}: `, error);
        return { data: {}};
    });
    const searchResult = JSON.parse(response.data);
    if(searchResult.total > 0){
        const levels = await readJsonFile('./temp_data/mold.json');
        // updateAllValues('./temp_data/mold.json', (level) => {
        //     return searchResult.levels[0].ID as number;
        // });
        console.log(levels);
                
        // 2. Modify each element
        var targetLevel = levels.find((element) => {
            return element.Level == name;
        });

        console.log(targetLevel);

        targetLevel.ID = searchResult.levels[0].ID.toString();

        // 3. Write back to the file
        await writeJsonFile('./temp_data/mold.json', levels);
    }
    await sleep(1000);
}