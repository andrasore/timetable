import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const cache = new Map<string, string>();

export const readIcon = async (name: string): Promise<string> => {
    if (cache.has(name)) {
        return cache.get(name)!;
    }
    const iconPath = path.join(import.meta.dirname, `../../node_modules/ionicons/dist/svg/${name}.svg`);
    const iconStr = await fs.readFile(iconPath, 'utf-8');
    cache.set(name, iconStr);
    return iconStr;
}
