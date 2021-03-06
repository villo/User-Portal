enyo.kind({
	name: "friendsPage",
	kind: "Page",
	events: {
		onFriendClicked: ""
	},
	components: [
		{tag: "a", showing: true, name: "editProfileButton", classes: "btn btn-primary pull-right", onclick: "editProfile", onclick: "addFriend", components: [
			{tag: "i", classes: "icon-plus icon-white"},
			{tag: "span", content: " Add Friend"}
		]},
		//Lazy way to do this, but it works
		{tag: "br"},
		{tag: "br"},
		
		//We no longer really use this alert box.
		//{kind: "Alert", content: 'You can add a friend by searching for their profile, then pressing the "Add Friend" button.', type: "info"},
		
		{kind: "friendsModule", onBubble: "activate", columns: 3, onclick: "handleFriendClick"},
		{name: "friendAdder", kind: "Modal", keyboard: true, components: [
			{kind: "ModalHeader", content: "Add Friend", closeButton: true},
			{kind: "ModalBody", components: [
				{kind: "Alert", showing: false, name: "theFriendError", type: "error", content: "That username does not exist!"},
				{tag: "form", classes: "form-horizontal", components: [
					{classes: "control-group", components: [
						{tag: "label", classes: "control-label", content: "Search for a user: "},
						{classes: "controls", components:[
							{tag: "input", name: "suggestNewFriend", classes: "input", attributes: {"type": "text"}, onkeydown: "friendKeyUp"}
						]},
					]}
				]},
			]},
			{kind: "ModalFooter", components: [
				{classes: "btn btn-success", name: "addTheFriend", content: "Add Friend", onclick: "confirmAdd", attributes: {"data-loading-text": "Adding Friend..."}},
				{classes: "btn", content: "Cancel", onclick: "closeAddFriend"}
			]}
		]}
	],
	addFriend: function(){
		this.$.friendAdder.show();
	},
	confirmAdd: function(inSender){
		$("#" + this.$.addTheFriend.id).button("loading");
		this.$.suggestNewFriend.hasNode();
		var username = this.$.suggestNewFriend.node.value;
		villo.friends.add({
			username: username,
			callback: enyo.bind(this, this.addedFriend)
		});
	},
	addedFriend: function(inSender){
		if(inSender && inSender.friends){
			this.$.friendsModule.activate({existing: inSender});
			$("#" + this.$.addTheFriend.id).button("reset");
			this.$.friendAdder.hide();
			this.$.suggestNewFriend.hasNode();
			this.$.suggestNewFriend.node.value = "";
		}else{
			this.$.theFriendError.setShowing(true);
			$("#" + this.$.addTheFriend.id).button("reset");
		}
	},
	closeAddFriend: function(){
		this.$.friendAdder.hide();
		this.$.suggestNewFriend.hasNode();
		this.$.suggestNewFriend.node.value = "";
	},
	rendered: function(){
		this.inherited(arguments);
		$("#" + this.$.suggestNewFriend.id).typeahead({
			source: function( typeahead, query ) {
				//Add the timeouts to lessen the number of requests we make.
				if("theTimeout" in window){
					window.clearTimeout(theTimeout);
				}
				theTimeout = window.setTimeout(enyo.bind(this, function(){
				villo.suggest.username({
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
				}), 250);
			},
		});
	},
	activate: function(){
		this.$.friendsModule.activate();
	},
	handleFriendClick: function(inSender, inEvent){
		//Extract the username out of the event. It should only be 2 or 3 layers deep, but we go 4 just to be sure.
		var username = false;
		if(inEvent.dispatchTarget.username){
			username = inEvent.dispatchTarget.username;
		}else if(inEvent.dispatchTarget.parent.username){
			username = inEvent.dispatchTarget.parent.username;
		}else if(inEvent.dispatchTarget.parent.parent.username){
			username = inEvent.dispatchTarget.parent.parent.username;
		}else if(inEvent.dispatchTarget.parent.parent.parent.username){
			username = inEvent.dispatchTarget.parent.parent.parent.username;
		}
		//Bubble event to the book (body.js).
		if(username !== false && username !== ""){
			this.bubble("onFriendClicked", username);
		}else{
			//Probably an empty click.
		}
	}
});

enyo.kind({
	name: "friendsModule",
	kind: "Control",
	published: {
		//Number of columns of friends to render.
		columns : 4,
		//Limit of how many users to load.
		limit: 100
	},
	events: {
		onBubble: ""
	},
	components: [
		{tag: "ul", classes: "thumbnails", name: "renderBlock"}
	],
	columnSpan: null,
	itemsRendered: 0,
	activate: function(inData){
		//Check to see if we're already being passed the info. This is request-saving.
		if(inData && inData.existing){
			this.getFriends(inData.existing);
		}else{
			villo.friends.get({
				callback: enyo.bind(this, this.getFriends)
			});
		}
	},
	create: function(){
		this.inherited(arguments);
		//Set up number of columns:
		this.columnSpan = Math.floor(12 / this.columns);
	},
	getFriends: function(inSender){
		if(inSender && inSender.friends){
			this.$.renderBlock.destroyComponents();
			enyo.forEach(inSender.friends, this.renderFriends, this);
		}
		this.$.renderBlock.render();
	},
	renderFriends: function(inSender){
		if(this.itemsRendered < this.limit){
			this.$.renderBlock.createComponent({kind: "friendsItem", onBubble: "workItUp", classes: "span" + this.columnSpan, username: inSender});
			this.itemsRendered++;
		}
	},
	workItUp: function(){
		this.bubble("onBubble");
	}
});

enyo.kind({
	name: "friendsItem",
	kind: "Control",
	tag: "li",
	published: {
		username: ""
	},
	events: {
		onBubble: ""
	},
	components: [
		{tag: "a", classes: "thumbnail", onmouseover: "itemHover", onmouseout: "itemHoverOut", style: "text-decoration: none;", components: [
			{tag: "span", allowHtml: true, name: "exitFriend", showing: false, classes: "pull-right close", content: "&times;", onclick: "deleteFriend"},
			{tag: "br"},
			{tag: "br"},
			{name: "avatar", tag: "img"},
			{name: "username", content: "", tag: "h3", style: "text-align: center;"},
			{tag: "br"},
		]},
		//TODO: Drop this into a kind so that we can generate it on-the-fly.
		{kind: "Modal", onclick: "stopTheProp", keyboard: true, background: false, components: [
			{kind: "ModalHeader", content: "Delete Friend?"},
			{kind: "ModalBody", components: [
				{content: "", name: "replaceMe"}
			]},
			{kind: "ModalFooter", components: [
				{kind: "bootstrap.Button", name: "deleter", type: "danger", content: "Delete Friend", onclick: "deleteTheFriend"},
				{tag: "a", classes: "btn", content: "Cancel", onclick: "closeModal"}
			]}
		]}
	],
	itemHover: function(){
		this.$.exitFriend.setShowing(true);
	},
	itemHoverOut: function(){
		this.$.exitFriend.setShowing(false);
	},
	deleteFriend: function(iSender, inEvent){
		this.handleDelete("empty", inEvent);
		//Stop the event from reaching the catch-all click handler.
		return true;
	},
	stopTheProp: function(iSender, inEvent){
		//There's a weird bug that causes the modal clicks to pass through, so we need to stop the event propagation.
		return true;
	},
	deleteTheFriend: function(){
		this.$.deleter.loading("Deleting...");
		villo.friends.remove({
			username: this.deleteUsername,
			callback: enyo.bind(this, this.propagateRemoval)
		});
	},
	propagateRemoval: function(inData){
		//Set button state
		this.$.deleter.reset();
		
		//Instead of chaining events up, we'll just call the owner's functions directly.
		this.$.modal.hide();
		
		//Calling this will kill us:
		window.setTimeout(enyo.bind(this, function(){
			this.owner.owner.activate({existing: inData});
		}), 100);
	},
	handleDelete: function(inSender, inEvent){
		var username = false;
		if(inEvent.dispatchTarget.username){
			username = inEvent.dispatchTarget.username;
		}else if(inEvent.dispatchTarget.parent.username){
			username = inEvent.dispatchTarget.parent.username;
		}else if(inEvent.dispatchTarget.parent.parent.username){
			username = inEvent.dispatchTarget.parent.parent.username;
		}else if(inEvent.dispatchTarget.parent.parent.parent.username){
			username = inEvent.dispatchTarget.parent.parent.parent.username;
		}
		//Bubble event to the book (body.js).
		if(username !== false && username !== ""){
			this.deleteUsername = username;
			this.$.replaceMe.setContent("Are you sure you want to delete your friend " + username + "?");
			this.$.modal.show();
		}else{
			//Some error.
		}
		
	},
	closeModal: function(){
		this.$.modal.hide();
	},
	create: function(){
		this.inherited(arguments);
		this.$.avatar.setAttributes({
			"src": "https://api.villo.me/avatar.php?small=true&username=" + this.username
		});
		this.$.username.setContent(this.username);
	}
});
