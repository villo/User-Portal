enyo.kind({
	name: "homePage",
	kind: "Page",
	components: [
		{classes: "row", components: [
			{kind: "homePageItem", content: "Test 1, with a little content.", username: "kesne"},
			{kind: "homePageItem", content: "Test 2"},
			{kind: "homePageItem", content: "Test 3, with some more content."}
		]}
	]
});


enyo.kind({
	name: "homePageItem",
	kind: "Control",
	published: {
		"span": 6,
		"content": "",
		"username": "Guest"
	},
	components: [
		{classes: "row-fluid", components: [
			{classes: "span2", components: [
				{classes: "thumbnail", name: "avatar", style: "height: 50px; width: 50px;", tag: "img", src: "source/img/ajax-loader.gif"}
			]},
			{classes: "span10", components: [
				{classes: "pull-right btn-group", components: [
					{kind: "Button", classes: "btn btn-mini dropdown-toggle", attributes: {"data-toggle": "dropdown"}, components: [
						{tag: "span", classes: "caret"}
					]},
					{tag: "ul", classes: "dropdown-menu", components: [
						{tag: "li", components: [
							{tag: "a", content: "View Profile", onclick: "viewProfile"}
						]},
						{tag: "li", components: [
							{tag: "a", content: "Hide Post", onclick: "hidePost"}
						]},
						{tag: "li", classes: "divider"},
						{tag: "li", components: [
							{tag: "a", content: "View App", onclick: "hidePost"}
						]},
					]}
				]},
				{content: "", name: "username", tag: "h3"},
				{classes: "well", name: "content", content: ""}
			]},
		]}
	],
	hidePost: function(){
		//Animate it out:
		//Then remove it completely: 
		this.destroy();
	},
	create: function(){
		this.inherited(arguments);
		this.addClass("span" + this.span);
		this.$.content.setContent(this.content);
		this.$.username.setContent(this.username);
		this.$.avatar.setSrc("https://api.villo.me/avatar.php?thumbnail=true&username=" + escape(this.username));
	}
});
