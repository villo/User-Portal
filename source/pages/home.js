enyo.kind({
	name: "homePage",
	kind: "Page",
	handlers: {
		onPageChange: "changePage"
	},
	components: [
		{classes: "row", components: [
			{classes: "span3", components: [
				{kind: "homePageNavigation"}
			]},
			{classes: "span9", components: [
				{kind: "Poster"},
				//Super Class:
				{kind: "homePageSuperClass"}
			]}
		]}
	],
	changePage: function(inSender, inEvent){
		this.$.homePageSuperClass.changePage(inEvent);
	}
});

enyo.kind({
	name: "homePageNavigation",
	kind: "Control",
	active: "feed",
	components: [
		{classes: "well", style: "padding: 8px 0;", components: [
			{tag: "ul", classes: "nav nav-list", components: [
				{tag: "li", classes: "nav-header", content: "Real-Time Updates"},
				{name: "feed", kind: "homePageNavigationItem", content: "Live Feed", icon: "th-list", active: true, onclick: "setActive"},
				{name: "friends", kind: "homePageNavigationItem", content: "Friends", icon: "user", onclick: "setActive"},
				{name: "apps", kind: "homePageNavigationItem", content: "Apps", icon: "pencil", onclick: "setActive"},
				{tag: "li", classes: "divider"},
				{name: "search", kind: "homePageNavigationItem", content: "Search", icon: "search", onclick: "setActive"},
			]}
		]}
	],
	setActive: function(inSender){
		this.$[this.active].setActive(false);
		this.active = inSender.name;
		this.$[this.active].setActive(true);
		this.bubble("onPageChange", this.active);
	}
});

enyo.kind({
	name: "homePageNavigationItem",
	tag: "li",
	style: "cursor: pointer;",
	published: {
		active: false,
		content: "",
		icon: "",
	},
	components: [
		{tag: "a", components: [
			{tag: "i", name: "icon"},
			{tag: "span", name: "content", content: ""}
		]},
	],
	setActive: function(inSender){
		if(inSender === true){
			this.addClass("active");
			this.$.icon.addClass("icon-white");
		}else if(inSender === false){
			this.removeClass("active");
			this.$.icon.removeClass("icon-white");
		}
	},
	create: function(){
		this.inherited(arguments);
		if(this.icon !== ""){
			this.content = " " + this.content;
			this.$.icon.addClass("icon-" + this.icon);
		}
		if(this.active === true){
			this.$.icon.addClass("icon-white");
			this.addClass("active")
		}
		this.$.content.setContent(this.content);
	}
});

enyo.kind({
	name: "homePageItem",
	kind: "Control",
	prepend: true,
	published: {
		"span": false,
		"content": "",
		"username": "Guest",
		"timestamp": enyo.now()
	},
	style: "margin-bottom: 10px; display: none;",
	components: [
		{classes: "row-fluid", components: [
			{classes: "pull-left", style: "width: 60px;", components: [
				{classes: "thumbnail", name: "avatar", style: "height: 50px; width: 50px;", tag: "img", src: "source/img/ajax-loader.gif"}
			]},
			{classes: "pull-right", style: "width: 620px;", components: [
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
		if(this.span){
			this.addClass("span" + this.span);
		}
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


/*
 * Home Page Super-Class
 * =====================
 * 
 * This is the kind that holds the book for the different feeds on the home page.
 */

enyo.kind({
	name: "homePageSuperClass",
	components: [
		{kind: "Book", components: [
			{name: "feed", kind: "homePageFeed"},
			{name: "friends", kind: "homePageFriend"},
			{name: "apps", kind: "homePageFriend"},
			{name: "search", kind: "homePageSearch"},
		]}
	],
	rendered: function(){
		/*
		 * We need a global listen function, because we can only listen to one room at a time.
		 * This function deploys all retrieved messages to all clients, so they can manage it how they want to.
		 */
		villo.feeds.listen({
			callback: enyo.bind(this, this.deploy)
		});
	},
	deploy: function(inSender){
		var c = this.$.book.getControls();
		for(var x in c){
			c[x].action(inSender);
		}
	},
	changePage: function(inSender){
		this.page = inSender;
		this.$.book.pageName(this.page);
	}
});
//Feed page:
enyo.kind({
	name: "homePageFeed",
	components: [
	
	],
	action: function(inSender){
		this.createComponent({kind: "homePageItem", content: inSender.description, timestamp: inSender.timestamp, username: inSender.username}).render();
		jQuery("span.timeago").timeago();
	},
	rendered: function(){
		this.inherited(arguments);
		
	}
});
//Friend page:
enyo.kind({
	name: "homePageFriend",
	components: [
		
	],
	friends: [],
	action: function(inSender){
		this.createComponent({kind: "homePageItem", content: inSender.description, timestamp: inSender.timestamp, username: inSender.username}).render();
		jQuery("span.timeago").timeago();
	},
	rendered: function(){
		this.inherited(arguments);
		villo.friends.get({
			callback: enyo.bind(this, function(inSender){
				this.friends = inSender.friends || [];
			})
		});
	}
});
//Search page:
enyo.kind({
	name: "homePageSearch",
	components: [
	
	],
	action: function(){},
	activate: function(){}
});
