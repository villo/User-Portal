enyo.kind({
	name: "homePage",
	kind: "Page",
	components: [
		{classes: "row", components: [
			{kind: "homePageItem", content: "Test 1, with a little content.", username: "kesne"},
			{kind: "homePageItem", content: "Test 2"},
			{kind: "homePageItem", content: "Test 3, with some more content."}
		]}
	],
	create: function(){
		//Call history:
		
		//Listen: 
	},
	rendered: function(){
		this.inherited(arguments);
		//Set up "timeago", which manages our timestamps:
		jQuery("span.timeago").timeago();
	}
});

enyo.kind({
	name: "homePageItem",
	kind: "Control",
	published: {
		"span": 6,
		"content": "",
		"username": "Guest",
		"timestamp": enyo.now()
	},
	style: "margin-bottom: 10px;",
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
							{tag: "a", content: "View App", onclick: "viewApp"}
						]},
					]}
				]},
				{content: "", name: "username", tag: "h3"},
				{classes: "well", name: "content", style: "margin-bottom: 5px;"},
				//Timestamp:
				{tag: "span", classes: "timeago pull-right", style: "font-size: 11px; color: #999;", name: "timestamp", content: ""}
			]},
		]}
	],
	hidePost: function(){
		//Animate it out with jQuery:
		$("#" + this.id).fadeOut(400, enyo.bind(this, function(){
			//Then remove it completely: 
			this.destroy();
		}));
	},
	viewProfile: function(){
		this.bubble("onViewProfile", this.username);
	},
	create: function(){
		this.inherited(arguments);
		this.addClass("span" + this.span);
		this.$.content.setContent(this.content);
		this.$.username.setContent(this.username);
		this.$.avatar.setSrc("https://api.villo.me/avatar.php?thumbnail=true&username=" + escape(this.username));
		this.$.timestamp.setAttribute("title", new Date(this.timestamp).toISOString());
	}
});
