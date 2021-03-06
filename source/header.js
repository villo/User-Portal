enyo.kind({
	name: "header",
	kind: "Control",
	events: {
		onPageChange: ""
	},
	components: [
		{classes: "navbar navbar-fixed-top", components: [
			{classes: "navbar-inner", components: [
				{classes: "container", components: [
					{tag: "a", classes: "btn btn-navbar", attributes: {"data-toggle": "collapse", "data-target": ".nav-collapse"}, components: [
						{tag: "span", classes: "icon-bar"},
						{tag: "span", classes: "icon-bar"},
						{tag: "span", classes: "icon-bar"}
					]},
					{tag: "a", page: "home", classes: "brand", content: "Villo", style: "cursor: pointer;", onclick: "handleLogoClick"},
					{classes: "nav-collapse", components: [
						{tag: "ul", name: "nav", classes: "nav", components: [
							{tag: "li", classes: "active", style: "cursor: pointer;", components: [
								{tag: "a", name: "home", content: "Home", onclick: "headerClickHandler"},
							]},
							{tag: "li", classes: "", components: [
								{tag: "a", name: "profile", style: "cursor: pointer;", content: "Profile", onclick: "headerClickHandler"},
							]},
							{tag: "li", classes: "", components: [
								{tag: "a", name: "friends", style: "cursor: pointer;", content: "Friends", onclick: "headerClickHandler"},
							]},
							{tag: "li", classes: "", components: [
								{tag: "a", name: "apps", style: "cursor: pointer;", content: "Apps", onclick: "headerClickHandler"},
							]},
						]},
						
						{name: "searchForm", classes: "navbar-search pull-left", components: [
							{tag: "input", name: "userSearch", classes: "search-query", attributes: {"type": "search", "placeholder": "Search for User", "autocomplete": "off"}},
						]},
						
						{tag: "ul", classes: "nav pull-right", components: [
						 	//Optional: Just a small stylistic flare:
						 	//{tag: "li", classes: "divider-vertical"},
							{tag: "li", classes: "dropdown", components: [
								{tag: "a", classes: "dropdown-toggle", attributes: {"href": "#", "data-toggle": "dropdown"}, components: [
									{tag: "span", name: "headerUsername", content: ""},
									{tag: "b", classes: "caret"}
								]},
								{tag: "ul", classes: "dropdown-menu", components:[
									{tag: "li", components: [
										{tag: "a", attributes: {"href": "#"}, content: "Profile", action: "profile", onclick: "handleDropClick"}
									]},
									{tag: "li", components: [
										{tag: "a", attributes: {"href": "#"}, content: "My Apps", action: "apps", onclick: "handleDropClick"}
									]},
									{tag: "li", components: [
										{tag: "a", attributes: {"href": "#"}, content: "Settings", action: "settings", onclick: "handleDropClick"}
									]},
									{tag: "li", classes: "divider"},
									{tag: "li", components: [
										{tag: "a", attributes: {"href": "#"}, content: "Logout", action: "logout", onclick: "handleDropClick"}
									]},
								]}
							]}
						]}
					]}
				]}
			]}
		]},
		{kind: "settingsPage", name: "settingsPage"},
	],
	
	//This function is called when the user if finally logged in, or when it's confirmed that they are.
	loggedIn: function(){
		this.$.headerUsername.setContent(villo.user.username);
	},
	
	headerClickHandler: function(inSender){
		for(x in this.$.nav.getControls()){
			if(this.$.nav.getControls().hasOwnProperty(x)){
				if(this.$.nav.getControls()[x].hasClass("active")){
					this.$.nav.getControls()[x].removeClass("active");
				}
			}
		}
		inSender.parent.addClass("active");
		this.bubble("onPageChange", {
			page: inSender.name,
			data: inSender.data || ""
		});
	},
	
	handleLogoClick: function(inSender){
		for(x in this.$.nav.getControls()){
			if(this.$.nav.getControls().hasOwnProperty(x)){
				if(this.$.nav.getControls()[x].hasClass("active")){
					this.$.nav.getControls()[x].removeClass("active");
				}
			}
		}
		this.$.home.parent.addClass("active");
		this.bubble("onPageChange", {
			page: inSender.page,
			data: ""
		});
	},
	
	deactiveActive: function(inSender){
		for(x in this.$.nav.getControls()){
			if(this.$.nav.getControls().hasOwnProperty(x)){
				if(this.$.nav.getControls()[x].hasClass("active")){
					this.$.nav.getControls()[x].removeClass("active");
				}
			}
		}
		this.$[inSender].parent.addClass("active");
	},
	
	handleDropClick: function(inSender){
		//These actions can't be generalized, so we're going to make specific cases for each event.
		if(inSender.action === "logout"){
			if(villo.user.logout() === true){
				window.location.reload();
			}
		}else if(inSender.action === "profile"){
			this.deactiveActive("profile");
			this.bubble("onPageChange", {
				page: "profile",
				data: ""
			});
		}else if(inSender.action === "settings"){
			this.$.settingsPage.open("settings");
		}else if(inSender.action === "apps"){
			this.$.settingsPage.open("apps");
		}
	},
	
	rendered: function(){
		this.inherited(arguments);
		$("#" + this.$.userSearch.id).typeahead({
			source: function( typeahead, query ) {
				if(villo && villo.suggest){
					var suggest = villo.suggest.username({
						username: query,
						callback: enyo.bind(this, function(inSender){
							if(inSender && inSender.profile){
								//Build suggestions based on return.
								var sourceBlock = [];
								
								enyo.forEach(inSender.profile, function(x){
									sourceBlock.push(x.username);
								});
								
								typeahead.process(sourceBlock);
							}else{
								typeahead.process([]);
							}
						})
					});
				}else{
					typeahead.process([]);
				}
			},
			onselect: enyo.bind(this, function(){
				for(x in this.$.nav.getControls()){
					if(this.$.nav.getControls().hasOwnProperty(x)){
						if(this.$.nav.getControls()[x].hasClass("active")){
							this.$.nav.getControls()[x].removeClass("active");
						}
					}
				}
				this.$.profile.parent.addClass("active");
				this.$.userSearch.hasNode();
				this.bubble("onPageChange", {
					page: "profile",
					data: {username: this.$.userSearch.node.value}
				});
				this.$.userSearch.node.blur();
				//We like to maintain what's in the search: 
				//this.$.userSearch.node.value = "";
			})
		});
	},
});