enyo.kind({
	name: "footer",
	kind: "Control",
	components: [
		{tag: "hr"},
		{tag: "footer", components: [
			{tag: "p", components: [
				{classes: "pull-left", components: [
					{allowHtml: true, content: "&copy; Villo 2012"},
					{tag: "a", content: "Privacy Policy", attributes: {"href": "http://villo.me/legal/privacy/"}}
				]},
				{allowHtml: true, classes: "pull-right", content: "Built using <a href='http://enyojs.com' target='_blank'>Enyo</a> and <a href='http://twitter.github.com/bootstrap/' target='_blank'>Bootstrap</a>."}
			]},
		]}
	]
});
