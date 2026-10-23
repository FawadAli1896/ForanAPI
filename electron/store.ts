import { app } from 'electron';
import fs from 'fs';
import path from 'path';

export class LocalStore {
  private filePath: string;

  constructor(fileName: string = 'foranapi-store.json') {
    const userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    this.filePath = path.join(userDataPath, fileName);
  }

  public get<T>(key: string, defaultValue: T): T {
    try {
      if (!fs.existsSync(this.filePath)) {
        return defaultValue;
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const data = JSON.parse(raw);
      return data[key] !== undefined ? data[key] : defaultValue;
    } catch (err) {
      console.error(`Failed to read key ${key} from store:`, err);
      return defaultValue;
    }
  }

  public set<T>(key: string, value: T): void {
    try {
      let data: Record<string, any> = {};
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        data = JSON.parse(raw);
      }
      data[key] = value;
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Failed to write key ${key} to store:`, err);
    }
  }

  public getAll(): any {
    try {
      if (!fs.existsSync(this.filePath)) {
        return null;
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to read all from store:', err);
      return null;
    }
  }

  public saveAll(data: any): boolean {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Failed to save all to store:', err);
      return false;
    }
  }
}
