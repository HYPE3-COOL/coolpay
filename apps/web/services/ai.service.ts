import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { XMLParser } from 'fast-xml-parser';

export enum PromptType {
    Instruction = 'instruction',
}

export class AiService {
    // Generic function: accepts prompt and returns parsed XML (or raw text if not XML)
    static async analyzeWithPrompt(prompt: string) {
        const result = await generateText({
            model: openai('gpt-4o'),
            prompt,
        });
        const xml = result.text;
        console.log('AI response:', xml); // Debugging log
        try {
            const parser = new XMLParser();
            const json = parser.parse(xml);
            console.log({ parsedJson: json }); // Debugging log
            // If the root is <transaction>, return that, else return the whole object
            return json.transaction ?? json;
        } catch {
            // If not XML, just return the raw text
            return xml;
        }
    }

    static buildPrompt(type: PromptType, text: string) {
        switch (type) {
            case PromptType.Instruction:
                return `
Extract the following fields from the sentence below and return them as XML:

- platform_account: the Twitter username of the platform (the sender)
- creator: the Twitter username of the person being asked to reply
- amount: the amount being promised
- token: the token/currency being promised
- deadline: the deadline for the reply (in ISO 8601 format if possible, assume current year if not specified)
- message: the message/question being asked

Sentence:
"${text}"`;
            // Add more cases for other prompt types here
            default:
                throw new Error('Unknown prompt type');
        }
    }

    // Convenience function for your main use case
    static async analyze(type: PromptType, text: string) {
        const prompt = this.buildPrompt(type, text);
        console.log('Generated prompt:', prompt); // Debugging log
        return this.analyzeWithPrompt(prompt);
    }
}