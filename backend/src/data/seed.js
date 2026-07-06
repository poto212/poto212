import { initStorage, getProvider } from './storage.js';

await initStorage();
console.log(`Base inicializada con datos demo en provider ${getProvider()}`);
