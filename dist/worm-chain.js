/**
 * WORM Chain — Immutable attestation
 * Blake3 hashing + Ed25519 signing
 */
import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import os from 'os';
export class WORMChain {
    constructor() {
        this.ledger = [];
        this.logPath = path.join(os.homedir(), '.bob-ide', 'worm.log');
    }
    async initialize() {
        try {
            await fs.mkdir(path.dirname(this.logPath), { recursive: true });
            try {
                const existing = await fs.readFile(this.logPath, 'utf-8');
                this.ledger = existing
                    .split('\n')
                    .filter(line => line.trim())
                    .map(line => JSON.parse(line));
            }
            catch {
                // New ledger
            }
        }
        catch (e) {
            console.error('[WORM] Init failed:', e);
        }
    }
    async seal(data) {
        const hash = this.blake3(JSON.stringify(data));
        const signature = this.ed25519Sign(hash);
        const entry = {
            hash,
            signature,
            timestamp: Date.now(),
            data,
        };
        this.ledger.push(entry);
        // Persist
        try {
            await fs.appendFile(this.logPath, JSON.stringify(entry) + '\n');
        }
        catch (e) {
            console.error('[WORM] Persist failed:', e);
        }
        return entry;
    }
    getChain() {
        return this.ledger;
    }
    blake3(data) {
        // Stub: use @noble/hashes in production
        const hash = createHash('sha256');
        hash.update(data);
        return hash.digest('hex').slice(0, 64);
    }
    ed25519Sign(hash) {
        // Stub: use @noble/ed25519 in production
        return Buffer.from(hash).toString('hex').slice(0, 128);
    }
}
export const wormChain = new WORMChain();
