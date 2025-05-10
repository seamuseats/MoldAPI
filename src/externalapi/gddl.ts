import { Axios } from 'axios'
import { Demon, Level } from '../../generated/prisma';
import { db } from '../moldapi';

export const gddlAPI = new Axios({
    baseURL: "https://gdladder.com/api"
});

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function updateFromGDDL(){
    var levels = (await db.level.findMany());
    
    for (const i of levels) {
        updateWithID(i);
    }
    
}

export async function updateWithID(i: Level){
    const response = await gddlAPI.get(`/level/${i.id}`, {
        headers : {
            Accept: 'application/json'
        }
    }).then((message) => {
        console.log(message);
        return message;
    });
    const level = JSON.parse(response.data);
    await sleep(1000);
    await db.level.update({
        where : {
            id: i.id
        },
        data: {
            author: level.Meta.creator,
            difficulty: (level.Meta.Difficulty as string).toUpperCase() as Demon,
        }
    });
}