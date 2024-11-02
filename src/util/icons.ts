import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export const readIcon = async (name: string): Promise<string> => {
    const iconPath = path.join(import.meta.dirname, `../../node_modules/ionicons/dist/svg/${name}.svg`);
    return fs.readFile(iconPath, 'utf-8');
}
