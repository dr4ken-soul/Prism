const fs = require('fs');
const path = require('path');

const brainDir = 'C:/Users/Paul/.gemini/antigravity-ide/brain';
const dirs = fs.readdirSync(brainDir);

const keywords = ['deepsurge', 'explorer', 'feedback', 'github', 'sui address', 'refer', 'demo video'];

for (const dir of dirs) {
    const transcriptPath = path.join(brainDir, dir, '.system_generated', 'logs', 'transcript.jsonl');
    if (fs.existsSync(transcriptPath)) {
        const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
        for (const line of lines) {
            if (line.includes('"type":"USER_INPUT"')) {
                try {
                    const parsed = JSON.parse(line);
                    const content = parsed.content.toLowerCase();
                    if (keywords.some(k => content.includes(k))) {
                        console.log(`[${parsed.created_at}] [USER] ${parsed.content}`);
                        console.log('---');
                    }
                } catch(e) {}
            }
            if (line.includes('"type":"PLANNER_RESPONSE"')) {
                try {
                    const parsed = JSON.parse(line);
                    const content = parsed.content.toLowerCase();
                    if (keywords.some(k => content.includes(k))) {
                        console.log(`[${parsed.created_at}] [AI] ${parsed.content}`);
                        console.log('---');
                    }
                } catch(e) {}
            }
        }
    }
}
