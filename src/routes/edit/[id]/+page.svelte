<script>
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import SimpleTest from "$lib/models/SimpleTest";
	import QAForm from "$lib/components/QAForm.svelte";
	let test = $state();
	onMount(async () => {
		const testID = page.params.id;
		test = await SimpleTest.getOne(testID);
	});
</script>

{#if test}
	<QAForm {test} />
{/if}
