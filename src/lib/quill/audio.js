export function registerAudioBlot(Quill) {
	const BlockEmbed = Quill.import("blots/block/embed");

	class AudioBlot extends BlockEmbed {
		static blotName = "audio";
		static tagName = "audio";

		static create(url) {
			const node = super.create();
			node.setAttribute("src", url);
			node.setAttribute("controls", true);
			return node;
		}

		static value(node) {
			return node.getAttribute("src");
		}
	}

	Quill.register(AudioBlot);
}
