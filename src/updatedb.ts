import fs from 'fs/promises';
import path from 'path';
import { db } from './moldapi';
import { Level, User } from '../generated/prisma';

export async function readJsonFile(filePath: string): Promise<Array<any>> {
    try {
        const absolutePath = path.resolve(filePath);
        const data = await fs.readFile(absolutePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error;
    }
}

export async function writeJsonFile(filePath: string, data: any[]): Promise<void> {
    try {
        const absolutePath = path.resolve(filePath);
        await fs.writeFile(absolutePath, JSON.stringify(data, null, 2));
        console.log(`Successfully wrote updated data to ${filePath}`);
    } catch (error) {
        console.error('Error writing JSON file:', error);
        throw error;
    }
}

export async function updateAllValues(filePath: string, modifier: (currentValue: number) => number): Promise<void> {
    try {
        // 1. Read the data
        const data = await readJsonFile(filePath);
        
        // 2. Modify each element
        const updatedData = data.map(item => ({
            ...item,  // spread all existing properties
            ID: modifier(item.Level)  // update specific parameter
        }));
        
        // 3. Write back to the file
        await writeJsonFile(filePath, updatedData);
        
        console.log('Successfully updated all values');
    } catch (error) {
        console.error('Failed to update values:', error);
    }
}

export async function addCompletionsFromJson(level: any){
    try {
        
        // 2. Modify each element
        const ret = [
            (Number.parseInt(level.Spherical_Square) > 0),
            (Number.parseInt(level.T3EKO) > 0),
            (Number.parseInt(level.John_capitalism) > 0),
            (Number.parseInt(level.Seamuseats) > 0)
        ] as boolean[];
        console.log(ret);

        var completions: User[] = [];

        if(ret[0]){
            completions.push(await db.user.findUnique({
                where: {
                    id: 2
                }
            }) as User);
        }
        if(ret[1]){
            completions.push(await db.user.findUnique({
                where: {
                    id: 5
                }
            }) as User);
        }
        if(ret[2]){
            completions.push(await db.user.findUnique({
                where: {
                    id: 6
                }
            }) as User);
        }
        if(ret[3]){
            completions.push(await db.user.findUnique({
                where: {
                    id: 1
                }
            }) as User);
        }

        console.log(completions);

        await db.level.update({
            where: {
                id: Number.parseInt(level.ID)
            },
            data: {
                completions: {
                    connect: completions
                },
            }
        });
        
        
        
        console.log(`Successfully added victors to ${level.Level}`);
    } catch (error) {
        console.error('Failed to update values:', error);
    }
}