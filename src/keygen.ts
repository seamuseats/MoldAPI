import { randomBytes } from 'crypto';
import { db } from './moldapi'
import { User } from '../generated/prisma';

export async function genKey(expires?: Boolean, user?: User){
    var expirationDate = undefined;

    if (expires){
        expirationDate = new Date(Date.now() + 15552000000);
    }
    
    await db.apiKey.create({
        data: {
            key: randomBytes(32).toString('hex'),
            expirationDate: expirationDate,
            user: user ? { connect: { id: user.id } } : undefined
        }
    });
}
