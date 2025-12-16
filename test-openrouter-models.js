require('dotenv').config();

const models = [
    "meta-llama/llama-3-8b-instruct:free",
    "huggingfaceh4/zephyr-7b-beta:free",
    "openchat/openchat-7:free",
    "gryphe/mythomax-l2-13b:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "qwen/qwen-2-7b-instruct:free"
];

async function testModels() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    for (const model of models) {
        console.log(`Testing model: ${model}...`);
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Voice of Campus Test"
                },
                body: JSON.stringify({
                    "model": model,
                    "messages": [
                        {
                            "role": "user",
                            "content": "Hi"
                        }
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ SUCCESS with ${model}`);
                console.log(data.choices[0].message.content);
                return; // Found one!
            } else {
                console.log(`❌ FAILED ${model}: ${response.status}`);
            }
        } catch (e) {
            console.log(`❌ ERROR ${model}: ${e.message}`);
        }
    }
    console.log("All models failed.");
}

testModels();
