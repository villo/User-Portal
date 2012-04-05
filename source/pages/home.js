enyo.kind({
	name: "homePage",
	kind: "Page",
	components: [
		{classes: "row", components: [
			{kind: "homePageItem"},
			{kind: "homePageItem"}
		]}
	]
});

enyo.kind({
	name: "homePageItem",
	kind: "Control",
	published: {
		"span": 6
	},
	components: [
		{classes: "pull-right btn-group", components: [
			{kind: "Button", classes: "btn btn-mini dropdown-toggle", attributes: {"data-toggle": "dropdown"}, components: [
				{tag: "span", classes: "caret"}
			]},
			{tag: "ul", classes: "dropdown-menu", components: [
				{content: "Hi"}
			]}
		]},
		{content: "Kesne", tag: "h3"},
		{classes: "well", content: "Look, I'm in a a well!"}
	],
	create: function(){
		this.inherited(arguments);
		this.addClass("span" + this.span);
	}
});
