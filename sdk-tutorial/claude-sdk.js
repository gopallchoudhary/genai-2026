import {Anthropic} from '@anthropic-ai/sdk'

const client = new Anthropic({
    apiKey: process.env.OPENROUTER_API_KEY,
})


async function init() {
    const result = await client.messages.create({
        max_tokens: 1024,
        messages: [{role: 'user', content: 'Hello, what is your name?'}],
        model: 'claude-2',
    })

    for(const block of result.content) {
        if(block.type === 'text') {
            console.log(block.text)
        }
    }
}