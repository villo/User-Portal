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
				{tag: "hr", style: ""},
				//Super Class:
				{kind: "homePageSuperClass", onNotify: "handleNotify"}
			]}
		]}
	],
	handleNotify: function(inSender, inEvent){
		this.waterfall("onNewAlert", inEvent);
	},
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
				//{name: "apps", kind: "homePageNavigationItem", content: "Apps", icon: "pencil", onclick: "setActive"},
				{tag: "li", classes: "divider"},
				{name: "searcher", kind: "homePageNavigationItem", content: "Search", icon: "search", onclick: "setActive"},
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
	handlers: {
		onNewAlert: "handleAlert"
	},
	alerts: 0,
	components: [
		{tag: "a", components: [
			{tag: "i", name: "icon"},
			{tag: "span", name: "content", content: ""},
			{classes: "pull-right", name: "notif", showing: true, components: [
				{tag: "span", name: "notification", showing: false, classes: "badge badge-inverse", content: ""}
			]}
		]},
	],
	setActive: function(inSender){
		if(inSender === true){
			this.addClass("active");
			this.$.icon.addClass("icon-white");
			this.$.notif.setShowing(false);
		}else if(inSender === false){
			this.removeClass("active");
			this.$.icon.removeClass("icon-white");
			this.$.notif.setShowing(true);
		}
		this.clear();
	},
	handleAlert: function(inSender, inEvent){
		if(this.name.toLowerCase() === inEvent.toLowerCase()){
			this.notify();
		}
	},
	notify: function(){
		this.alerts = this.alerts + 1;
		if(this.alerts >= 1){
			this.$.notification.setShowing(true);
			this.$.notification.setContent(this.alerts);
		}else{
			this.$.notification.setShowing(false);
		}
	},
	clear: function(){
		//Reset
		this.alerts = -1;
		this.notify();
	},
	create: function(){
		this.inherited(arguments);
		if(this.icon !== ""){
			this.content = " " + this.content;
			this.$.icon.addClass("icon-" + this.icon);
		}
		if(this.active === true){
			this.setActive(true);
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
	handlers: {
		onmouseover: "mouseOver",
		onmouseout: "mouseOut"
	},
	style: "margin-bottom: 10px; display: none;",
	components: [
		{classes: "row-fluid", components: [
			{classes: "pull-left", style: "width: 60px; cursor: pointer;", onclick: "viewProfile", components: [
				{classes: "thumbnail", name: "avatar", style: "height: 50px; width: 50px;", tag: "img", src: "source/img/ajax-loader.gif"}
			]},
			{classes: "pull-right", style: "width: 620px;", components: [
				{classes: "pull-right btn-group", components: [
					{kind: "Button", name: "dropdownButton", classes: "btn btn-mini dropdown-toggle", attributes: {"data-toggle": "dropdown"}, components: [
						{tag: "span", classes: "caret"}
					]},
					{tag: "ul", classes: "dropdown-menu", components: [
						{tag: "li", components: [
							{tag: "a", content: "Repost", onclick: "repost"}
						]},
						{tag: "li", classes: "divider"},
						{tag: "li", components: [
							{tag: "a", content: "Hide Post", onclick: "hidePost"}
						]},
						{tag: "li", components: [
							{tag: "a", content: "View Profile", onclick: "viewProfile"}
						]},
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
		]},
		{kind: "Modal", keyboard: true, components: [
			{kind: "ModalHeader", name: "header", content: "", closeButton: true},
			{kind: "ModalBody", style: "padding-left: 30px;", components: [
				{kind: "Poster", name: "repost", content: " ", onPostDone: "doneRepost", repost: true, cancel: false}
			]},
		]}
	],
	doneRepost: function(){
		this.$.modal.hide();
	},
	repost: function(){
		this.$.modal.show();
	},
	mouseOver: function(){
		this.$.dropdownButton.applyStyle("opacity", 1);
	},
	mouseOut: function(){
		this.$.dropdownButton.applyStyle("opacity", 0.5);
	},
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
		this.$.repost.replaceContent(this.content);
		this.$.dropdownButton.applyStyle("opacity", 0.5);
		this.$.header.setHeaderContent('Reposting "' + this.username + '"');
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
			{name: "searcher", kind: "homePageSearch"}
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
	action: function(inSender, isHistory){
		if(!isHistory || isHistory !== true){
			this.bubble("onNotify", "feed");
		}
		this.createComponent({kind: "homePageItem", content: inSender.description, timestamp: inSender.timestamp, username: inSender.username}).render();
		jQuery("span.timeago").timeago();
	},
	create: function(){
		this.inherited(arguments);
		villo.feeds.history({
			type: "public",
			limit: 50,
			callback: enyo.bind(this,function(inSender){
				if(inSender && inSender.feeds){
					//We use prepending, so we need it in reverse order:
					inSender.feeds = inSender.feeds.reverse();
					for(var x in inSender.feeds){
						if(inSender.feeds.hasOwnProperty(x)){
							inSender.feeds[x].timestamp = parseInt(inSender.feeds[x].timestamp, 10);
							this.action(inSender.feeds[x], true);
						}
					}
				}
			})
		});
	}
});

//Friend page:
enyo.kind({
	name: "homePageFriend",
	components: [
		
	],
	friends: [],
	action: function(inSender, isHistory){
		var isFriend = false;
		for(var x in this.friends){
			if(this.friends.hasOwnProperty(x)){
				if(this.friends[x].toLowerCase() === inSender.username.toLowerCase()){
					isFriend = true;
				}
			}
		}
		if(isFriend === true){
			if(!isHistory || isHistory !== true){
				this.bubble("onNotify", "friends");
			}
			this.createComponent({kind: "homePageItem", content: inSender.description, timestamp: inSender.timestamp, username: inSender.username}).render();
			jQuery("span.timeago").timeago();
		}
	},
	create: function(){
		this.inherited(arguments);
		villo.friends.get({
			callback: enyo.bind(this, function(inSender){
				this.friends = inSender.friends || [];
				villo.feeds.history({
					type: "friends",
					limit: 50,
					callback: enyo.bind(this,function(inSender){
						if(inSender && inSender.feeds){
							//We use prepending, so we need it in reverse order:
							inSender.feeds = inSender.feeds.reverse();
							for(var x in inSender.feeds){
								if(inSender.feeds.hasOwnProperty(x)){
									inSender.feeds[x].timestamp = parseInt(inSender.feeds[x].timestamp, 10);
									this.action(inSender.feeds[x], true);
								}
							}
						}
					})
				});
			})
		});
	}
});

//Search page:
enyo.kind({
	name: "homePageSearch",
	components: [
		{tag: "form", classes: "form-search", components: [
			{kind: "Input", name: "input", attributes: {"type": "text", "placeholder": "Search for anything..."}, classes: "input-xlarge search-query", style: "margin-right: 8px;"},
			{kind: "bootstrap.Button", name: "searchButton", content: "Search", onclick: "handleSearch"}
		]},
		{tag: "hr"},
		{content: "Stuff will go here."}
	],
	handleSearch: function(){
		this.$.searchButton.loading("Searching...");
		var val = this.$.input.getValue();
		console.log(val);
		villo.feeds.search({
			text: val,
			callback: enyo.bind(this, function(){
				this.$.searchButton.reset();
			})
		});
	},
	action: function(){
		
	},
	create: function(){
		this.inherited(arguments);
	}
});
