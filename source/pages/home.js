enyo.kind({
	name: "homePage",
	kind: "Page",
	components: [
		{kind: "Poster"},
		{tag: "h6", content: "Real-time Updates"},
		{tag: "hr", style: "margin: 9px 0;"},
		{classes: "row", name: "posts", components: [
			//Populated auto-magically.
		]}
	],
	rendered: function(){
		this.inherited(arguments);
		//Call feed history:
		villo.feeds.history({
			callback: enyo.bind(this, this.gotHistory)
		});
		//Listen: 
		villo.feeds.listen({
			callback: enyo.bind(this, this.gotAction)
		})
	},
	gotAction: function(inSender){
		this.$.posts.createComponent({kind: "homePageItem", content: inSender.description, timestamp: inSender.timestamp, username: inSender.username});
		this.$.posts.render();
		jQuery("span.timeago").timeago();
	},
	gotHistory: function(inSender){
		for(var x in inSender){
			this.$.posts.createComponent({kind: "homePageItem", content: inSender[x].description, timestamp: inSender[x].timestamp, username: inSender[x].username}).render();
		};
		//Set up "timeago", which manages our timestamps:
		jQuery("span.timeago").timeago();
	}
});

enyo.kind({
	name: "Poster",
	kind: "Control",
	published: {
		"placeholder": "Share a new post...",
		"content": ""
	},
	expanded: false,
	style: "width: 460px; margin-bottom: 0px;",
	components: [
		{classes: "row-fluid", components: [
			{classes: "span2", components: [
				{classes: "thumbnail", name: "avatar", style: "height: 50px; width: 50px;", tag: "img", src: ""}
			]},
			{classes: "span10", components: [
				{name: "placeholder", classes: "well", showing: true, onclick: "swapView", components: [
					{tag: "input", name: "input", style: "margin-bottom: 0px;"},
					{kind: "bootstrap.Button", content: "New Post", classes: "pull-right"},
				]},
				{tag: "form", showing: false, name: "form", classes: "well", components: [
					{classes: "close", tag: "a", allowHtml: true, content: "&times;", style: "height: 0px; margin-top: -15px; margin-right: -15px;", onclick: "swapView"},
					{tag: "textarea", name: "area", classes: "input-xlarge", style: "resize: none; width: 330px;"},
					{classes: "pull-right", components: [
						{kind: "bootstrap.Button", type: "primary", content: "Post", onclick: "postItem"},
					]},
					//Floats screw up heights, so we manually add the padding:
					{style: "height: 19px;"}
				]}
			]},
		]}
	],
	create: function(){
		this.inherited(arguments);
		
		this.$.input.setAttribute("placeholder", this.placeholder);
		this.$.area.setAttribute("placeholder", this.placeholder);
		
		if(this.content !== ""){
			this.$.area.setContent(this.content);
			this.swapView();
		};
		
		this.$.avatar.setSrc("https://api.villo.me/avatar.php?thumbnail=true&username=" + escape(villo.user.getUsername()));
	},
	swapView: function(){
		if(this.expanded === false){
			this.expanded = true;
			this.$.placeholder.setShowing(false);
			this.$.form.setShowing(true);
			this.$.area.hasNode().focus();
		}else{
			this.expanded = false;
			this.$.area.hasNode().value = "";
			this.$.area.hasNode().blur();
			this.$.placeholder.setShowing(true);
			this.$.form.setShowing(false);
		}
	},
	postItem: function(){
		console.log("posting...");
		return true;
	}
})

enyo.kind({
	name: "homePageItem",
	kind: "Control",
	prepend: true,
	published: {
		"span": 6,
		"content": "",
		"username": "Guest",
		"timestamp": enyo.now()
	},
	style: "margin-bottom: 10px; display: none;",
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
		/*
		 * TODO: Should we do something more with this? Add it to some sort of Array of items we don't want to see?
		 */
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
		jQuery("#" + this.id).timeago();
	},
	rendered: function(){
		this.inherited(arguments);
		if(!this.created){
			this.created = true;
			$("#" + this.id).fadeIn(800);
		}else{
			$("#" + this.id).css("display", "block");
		}
	}
});
