"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStore = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class LocalStore {
    filePath;
    constructor(fileName = 'foranapi-store.json') {
        const userDataPath = electron_1.app.getPath('userData');
        if (!fs_1.default.existsSync(userDataPath)) {
            fs_1.default.mkdirSync(userDataPath, { recursive: true });
        }
        this.filePath = path_1.default.join(userDataPath, fileName);
    }
    get(key, defaultValue) {
        try {
            if (!fs_1.default.existsSync(this.filePath)) {
                return defaultValue;
            }
            const raw = fs_1.default.readFileSync(this.filePath, 'utf-8');
            const data = JSON.parse(raw);
            return data[key] !== undefined ? data[key] : defaultValue;
        }
        catch (err) {
            console.error(`Failed to read key ${key} from store:`, err);
            return defaultValue;
        }
    }
    set(key, value) {
        try {
            let data = {};
            if (fs_1.default.existsSync(this.filePath)) {
                const raw = fs_1.default.readFileSync(this.filePath, 'utf-8');
                data = JSON.parse(raw);
            }
            data[key] = value;
            fs_1.default.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
        }
        catch (err) {
            console.error(`Failed to write key ${key} to store:`, err);
        }
    }
    getAll() {
        try {
            if (!fs_1.default.existsSync(this.filePath)) {
                return null;
            }
            const raw = fs_1.default.readFileSync(this.filePath, 'utf-8');
            return JSON.parse(raw);
        }
        catch (err) {
            console.error('Failed to read all from store:', err);
            return null;
        }
    }
    saveAll(data) {
        try {
            fs_1.default.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
            return true;
        }
        catch (err) {
            console.error('Failed to save all to store:', err);
            return false;
        }
    }
}
exports.LocalStore = LocalStore;
