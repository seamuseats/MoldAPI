import fs from 'fs/promises';
import path from 'path';

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

export async function addCompletionsFromJson(){
    try {
        // 1. Read the data
        const data = await readJsonFile('./temp_data/mold.json');
        
        // 2. Modify each element
        const updatedData = data.map(item => {
            const ret = [
                (item.Spherical_Square > 0),
                (item.T3EKO > 0),
                (item.John_capitalism > 0),
                (item.Seamuseats > 0)
            ]
        });
        
        
        
        console.log('Successfully updated all values');
    } catch (error) {
        console.error('Failed to update values:', error);
    }
}