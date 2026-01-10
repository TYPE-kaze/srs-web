<script>
	let log = $state();
	let fileInput;
	let numberOfQuestions = 5;
	let content;
	const API_KEY = "";

	async function generateQAPairs(notes) {
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${API_KEY}`, // Replace YOUR_API_KEY with your actual API key
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo", // Use the correct model here, e.g., gpt-3.5-turbo or gpt-4
				messages: [
					{
						role: "system",
						content: "You are a helpful assistant.",
					},
					{
						role: "user",
						content: `Generate 10 question-answer pairs based on the following notes: ${notes}`,
					},
				],
				max_tokens: 500,
				temperature: 0.7,
			}),
		});

		// Check if the response status is OK (200)
		if (!response.ok) {
			console.error("API request failed with status:", response.status);
			return []; // Return an empty array if the request fails
		}

		const data = await response.json();

		// Check if the API response has the expected structure
		if (!data.choices || data.choices.length === 0) {
			console.error("API response does not contain choices:", data);
			return []; // Return an empty array if 'choices' is missing or empty
		}

		return data.choices[0].message.content
			.trim()
			.split("\n")
			.map((pair) => {
				const [question, answer] = pair.split("\n").map((item) => item.trim());
				return { question, answer };
			});
	}

	async function onclick() {
		console.log("is cooking");
		const res = await generateQAPairs(content);
		log = res;
		console.log(res);
	}

	async function onchange(event) {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			log = e.target.result;
			content = e.target.result;
		};
		reader.readAsText(file);
	}
</script>

<div class="container">
	<h1>Test OpenAI models</h1>

	<input class="form-control mb-3" {onchange} bind:this={fileInput} type="file" />
	<button {onclick} class="btn btn-primary">Test</button>
	<hr />
	<p>
		{#if log}
			{log}
		{:else}
			No log yet
		{/if}
	</p>
</div>

<style>
</style>
