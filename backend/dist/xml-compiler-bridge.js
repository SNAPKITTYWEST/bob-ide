"use strict";
/**
 * SOVEREIGN XML COMPILER BRIDGE
 * Natural language → valid XML system prompts (zero syntax errors, one shot)
 * Controls mini models (IBM Granite, Nemotron, etc.) via XML + natural language
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilationMode = void 0;
exports.compileNaturalLanguageToXML = compileNaturalLanguageToXML;
exports.controlModelViaXML = controlModelViaXML;
const fs_1 = require("fs");
const path_1 = require("path");
// =====================================================================
// XML COMPILATION MODES
// =====================================================================
var CompilationMode;
(function (CompilationMode) {
    CompilationMode["GBNF"] = "gbnf";
    CompilationMode["SKELETON"] = "skeleton";
    CompilationMode["DUALPASS"] = "dual-pass";
})(CompilationMode || (exports.CompilationMode = CompilationMode = {}));
// =====================================================================
// XML VALIDATOR
// =====================================================================
function validateXML(xmlText) {
    try {
        // Basic well-formedness check
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'text/xml');
        if (doc.documentElement.tagName === 'parsererror') {
            return {
                valid: false,
                errors: [doc.documentElement.textContent || 'XML parse error'],
            };
        }
        // Check required tags
        const requiredTags = ['system_prompt', 'identity', 'logic_gates', 'execution_flow'];
        const missingTags = requiredTags.filter((tag) => !doc.querySelector(tag));
        if (missingTags.length > 0) {
            return {
                valid: false,
                errors: [`Missing required tags: ${missingTags.join(', ')}`],
            };
        }
        return { valid: true, errors: [] };
    }
    catch (e) {
        return {
            valid: false,
            errors: [e.message],
        };
    }
}
// =====================================================================
// COMPILATION ORCHESTRATOR
// =====================================================================
async function compileNaturalLanguageToXML(req) {
    const startTime = Date.now();
    try {
        let xmlOutput;
        switch (req.mode) {
            case CompilationMode.GBNF:
                xmlOutput = await compileWithGBNF(req);
                break;
            case CompilationMode.SKELETON:
                xmlOutput = await compileWithSkeleton(req);
                break;
            case CompilationMode.DUALPASS:
                xmlOutput = await compileWithDualPass(req);
                break;
            default:
                throw new Error(`Unknown mode: ${req.mode}`);
        }
        const validation = validateXML(xmlOutput);
        return {
            mode: req.mode,
            input: req.naturalLanguage,
            xmlOutput,
            validationStatus: validation.valid ? 'VALID' : 'INVALID',
            metadata: {
                timestamp: Date.now(),
                executionTimeMs: Date.now() - startTime,
            },
        };
    }
    catch (error) {
        throw new Error(`XML compilation failed (${req.mode}): ${error.message}`);
    }
}
// =====================================================================
// MODE 1: GBNF CONSTRAINED DECODING
// =====================================================================
async function compileWithGBNF(req) {
    // Requires llama.cpp server with grammar support
    const llamaUrl = req.llamaUrl || process.env.LLAMA_URL || 'http://localhost:8080';
    try {
        // Read GBNF grammar
        const grammarPath = path_1.default.join(__dirname, '../artifacts/bridges/xml-compiler-grammars/sovereign_prompt.gbnf');
        const grammarText = await fs_1.promises.readFile(grammarPath, 'utf-8');
        // Call llama.cpp with grammar constraint
        const payload = {
            prompt: `Convert this natural language instruction into a sovereign XML system prompt:\n\n${req.naturalLanguage}`,
            grammar: grammarText,
            temperature: req.temperature || 0.3,
            n_predict: 2048,
        };
        const response = await fetch(`${llamaUrl}/completion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`llama.cpp responded with ${response.status}`);
        }
        const data = await response.json();
        return data.content || '';
    }
    catch (e) {
        throw new Error(`GBNF compilation failed: ${e.message}`);
    }
}
// =====================================================================
// MODE 2: SKELETON IN-FILLING
// =====================================================================
async function compileWithSkeleton(req) {
    const ollamaUrl = req.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
    const model = req.model || process.env.XML_MODEL || 'nemotron';
    try {
        // Read skeleton template
        const skeletonPath = path_1.default.join(__dirname, '../artifacts/bridges/xml-compiler-skeletons/sovereign_prompt.xml');
        const skeleton = await fs_1.promises.readFile(skeletonPath, 'utf-8');
        // Extract placeholders
        const placeholders = skeleton.match(/\{\{(\w+)\}\}/g) || [];
        const placeholderKeys = placeholders.map((p) => p.replace(/\{|\}/g, ''));
        // Call LLM to fill placeholders
        const systemPrompt = `You are a Skeleton Filler Agent.
You will receive an XML skeleton with {{PLACEHOLDER}} tokens.
Return ONLY a JSON object mapping each placeholder key to its value.
No XML. No explanation. Pure JSON.`;
        const userPrompt = `Skeleton placeholders to fill: ${placeholderKeys.join(', ')}

Natural language instruction:
${req.naturalLanguage}`;
        const payload = {
            model,
            system: systemPrompt,
            prompt: userPrompt,
            stream: false,
            options: {
                temperature: req.temperature || 0.3,
                top_p: 0.9,
            },
        };
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`Ollama responded with ${response.status}`);
        }
        const data = await response.json();
        const llmResponse = data.response || '{}';
        // Parse JSON response
        let fillMapping = {};
        try {
            fillMapping = JSON.parse(llmResponse);
        }
        catch {
            // Try extracting JSON from response
            const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                fillMapping = JSON.parse(jsonMatch[0]);
            }
        }
        // Inject values into skeleton
        let filledXML = skeleton;
        for (const [key, value] of Object.entries(fillMapping)) {
            filledXML = filledXML.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
        }
        // Remove any remaining placeholders
        filledXML = filledXML.replace(/\{\{(\w+)\}\}/g, '');
        return filledXML;
    }
    catch (e) {
        throw new Error(`Skeleton compilation failed: ${e.message}`);
    }
}
// =====================================================================
// MODE 3: DUAL-PASS CHAIN-OF-XML
// =====================================================================
async function compileWithDualPass(req) {
    const ollamaUrl = req.ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434';
    const model = req.model || process.env.XML_MODEL || 'nemotron';
    try {
        const systemPrompt = `You are a Compiler Agent. Convert natural language into sovereign XML prompts.

Follow this exact output sequence:
1. <thought_process>: outline the identity, logic gates, and execution flow needed.
2. <xml_output>: convert your thought process into the finalized XML.
   Do not output any text after </xml_output>.

The XML must match this structure:
<system_prompt>
  <identity>...</identity>
  <logic_gates><gate><name/><condition/><action/></gate></logic_gates>
  <execution_flow><step><order/><instruction/></step></execution_flow>
</system_prompt>`;
        const payload = {
            model,
            system: systemPrompt,
            prompt: req.naturalLanguage,
            stream: false,
            options: {
                temperature: req.temperature || 0.3,
                top_p: 0.9,
            },
        };
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`Ollama responded with ${response.status}`);
        }
        const data = await response.json();
        const fullResponse = data.response || '';
        // Extract <xml_output>...</xml_output>
        const xmlMatch = fullResponse.match(/<xml_output>([\s\S]*?)<\/xml_output>/);
        const xmlOutput = xmlMatch ? xmlMatch[1].trim() : fullResponse;
        return xmlOutput;
    }
    catch (e) {
        throw new Error(`Dual-pass compilation failed: ${e.message}`);
    }
}
async function controlModelViaXML(req) {
    const startTime = Date.now();
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    try {
        // Validate XML first
        const validation = validateXML(req.xmlPrompt);
        if (!validation.valid) {
            throw new Error(`Invalid XML prompt: ${validation.errors.join('; ')}`);
        }
        // Extract system prompt from XML
        const systemPrompt = extractSystemPromptFromXML(req.xmlPrompt);
        // Call LLM with XML-derived system prompt
        const payload = {
            model: req.model,
            system: systemPrompt,
            prompt: req.userQuery,
            stream: false,
            options: {
                temperature: req.temperature || 0.7,
                top_p: 0.9,
                num_predict: req.maxTokens || 512,
            },
        };
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`Ollama responded with ${response.status}`);
        }
        const data = await response.json();
        return {
            model: req.model,
            response: data.response || '',
            promptUsed: systemPrompt,
            executionTimeMs: Date.now() - startTime,
        };
    }
    catch (e) {
        throw new Error(`Model control failed: ${e.message}`);
    }
}
// =====================================================================
// UTILITY: Extract system prompt from XML
// =====================================================================
function extractSystemPromptFromXML(xmlText) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'text/xml');
        const identity = doc.querySelector('identity')?.textContent || '';
        const gates = Array.from(doc.querySelectorAll('logic_gates gate'))
            .map((gate) => `${gate.querySelector('name')?.textContent}: ${gate.querySelector('condition')?.textContent}`)
            .join('\n');
        const flow = Array.from(doc.querySelectorAll('execution_flow step'))
            .map((step) => `${step.querySelector('order')?.textContent}. ${step.querySelector('instruction')?.textContent}`)
            .join('\n');
        return `${identity}\n\nLogic Gates:\n${gates}\n\nExecution Flow:\n${flow}`;
    }
    catch {
        // Fallback: return raw XML
        return xmlText;
    }
}
exports.default = {
    compileNaturalLanguageToXML,
    controlModelViaXML,
    CompilationMode,
};
