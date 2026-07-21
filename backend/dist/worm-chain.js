"use strict";
/**
 * WORM Chain — Immutable attestation
 * Blake3 hashing + Ed25519 signing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.wormChain = exports.WORMChain = void 0;
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const path_1 = require("path");
const os_1 = require("os");
class WORMChain {
    constructor() {
        this.ledger = [];
        this.logPath = path_1.default.join(os_1.default.homedir(), '.bob-ide', 'worm.log');
    }
    async initialize() {
        try {
            await fs_1.promises.mkdir(path_1.default.dirname(this.logPath), { recursive: true });
            try {
                const existing = await fs_1.promises.readFile(this.logPath, 'utf-8');
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
            await fs_1.promises.appendFile(this.logPath, JSON.stringify(entry) + '\n');
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
        const hash = (0, crypto_1.createHash)('sha256');
        hash.update(data);
        return hash.digest('hex').slice(0, 64);
    }
    ed25519Sign(hash) {
        // Stub: use @noble/ed25519 in production
        return Buffer.from(hash).toString('hex').slice(0, 128);
    }
}
exports.WORMChain = WORMChain;
exports.wormChain = new WORMChain();
