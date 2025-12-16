require('dotenv').config();

async function testOpenRouter() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error("❌ No OPENROUTER_API_KEY found in .env");
        return;
    }

    console.log("Testing OpenRouter with key:", apiKey.substring(0, 10) + "...");

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
                "model": "microsoft/phi-3-mini-128k-instruct:free",
                "messages": [
                    {
                        "role": "user",
                        "content": "Say hello!"
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log("✅ Success!");
            console.log("Response:", data.choices[0].message.content);
        } else {
            console.error("❌ Error:", response.status, response.statusText);
            console.error("Details:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("❌ Network/Code Error:", error);
    }
}

testOpenRouter();
