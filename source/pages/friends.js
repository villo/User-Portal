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
		{content: "<br /><br />"},
		
		//We no longer really use this alert box.
		//{kind: "Alert", content: 'You can add a friend by searching for their profile, then pressing the "Add Friend" button.', type: "info"},
		
		{kind: "friendsModule", onBubble: "activate", columns: 3, onclick: "handleFriendClick"},
		{name: "friendAdder", kind: "Modal", keyboard: true, components: [
			{kind: "ModalHeader", content: "Add Friend", closeButton: true},
			{kind: "ModalBody", components: [
				{classes: "control-group", name: "registerControlGroup4", components: [
						{tag: "label", classes: "control-label", content: "Search for a user on Villo"},
						{classes: "controls", components:[
							{tag: "input", name: "suggestNewFriend", classes: "input", attributes: {"type": "text"}, onkeydown: "friendKeyUp"}
						]},
					]}
			]}
		]}
	],
	addFriend: function(){
		this.$.friendAdder.show();
	},
	friendKeyUp: function(){
		$("#" + this.$.suggestNewFriend.id).typeahead({
			source: function( typeahead, query ) {
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
						}
					})
				});
			},
		});
		
		return;
		
		
		if(this.timeout){
			window.clearTimeout(this.timeout);
		}
		this.timeout = window.setTimeout(enyo.bind(this, this.suggest), 1000);
	},
	suggest: function(){
		this.$.suggestNewFriend.hasNode();
		villo.suggest.username({
			username: this.$.suggestNewFriend.node.value,
			callback: enyo.bind(this, this.handleSuggest)
		});
	},
	handleSuggest: function(inSender){
		if(inSender && inSender.profile){
			//Build suggestions based on return.
			var sourceBlock = [];
			
			enyo.forEach(inSender.profile, function(x){
				sourceBlock.push(x.username);
			});
			
			console.log(sourceBlock);
			
			$("#" + this.$.suggestNewFriend.id).typeahead({
				source: sourceBlock
			});
		}
	},
	activate: function(){
		this.$.friendsModule.activate();
	},
	handleFriendClick: function(inSender){
		//Extract the username out of the event. It should only be 2 or 3 layers deep, but we go 4 just to be sure.
		var username = false;
		if(event.dispatchTarget.username){
			username = event.dispatchTarget.username;
		}else if(event.dispatchTarget.parent.username){
			username = event.dispatchTarget.parent.username;
		}else if(event.dispatchTarget.parent.parent.username){
			username = event.dispatchTarget.parent.parent.username;
		}else if(event.dispatchTarget.parent.parent.parent.username){
			username = event.dispatchTarget.parent.parent.parent.username;
		}
		//Bubble event to the book (body.js).
		if(username !== false && username !== ""){
			this.doFriendClicked(username);
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
		//
		//TODO
		//For some reason it didn't save the progress on the grid, so we're going to have to redo that.
		//
		{tag: "ul", classes: "thumbnails", name: "renderBlock"}
	],
	columnSpan: null,
	itemsRendered: 0,
	activate: function(inData){
		this.$.renderBlock.destroyComponents();
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
			enyo.forEach(inSender.friends, this.renderFriends, this);
		}
		
		this.render();
	},
	renderFriends: function(inSender){
		if(this.itemsRendered < this.limit){
			this.$.renderBlock.createComponent({kind: "friendsItem", onBubble: "doBubble", classes: "span" + this.columnSpan, username: inSender});
			this.itemsRendered++;
		}
	},
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
			{tag: "span", name: "exitFriend", showing: false, classes: "pull-right close", content: "&times;", onclick: "deleteFriend"},
			{name: "avatar", tag: "img"},
			{name: "username", content: "", tag: "h3", style: "text-align: center;"}
		]},
		{kind: "Modal", onclick: "stopTheProp", keyboard: true, background: false, components: [
			{kind: "ModalHeader", content: "Delete Friend?"},
			{kind: "ModalBody", components: [
				{content: "", name: "replaceMe"}
			]},
			{kind: "ModalFooter", components: [
				{tag: "a", classes: "btn btn-danger", content: "Delete Friend", onclick: "deleteTheFriend"},
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
	deleteFriend: function(){
		this.handleDelete();
		//Stop the event from reaching the catch-all click handler.
		event.stopPropagation();
	},
	stopTheProp: function(){
		//There's a weird bug that causes the modal clicks to pass through, so we need to stop the event propagation.
		event.stopPropagation();
	},
	deleteTheFriend: function(){
		villo.friends.remove({
			username: this.deleteUsername,
			callback: enyo.bind(this, this.propagateRemoval)
		});
	},
	propagateRemoval: function(inData){
		//Instead of chaining events up, we'll just call the owner's functions directly.
		this.$.modal.hide();
		//Calling this will cause us to die!
		window.setTimeout(enyo.bind(this, function(){
			this.owner.owner.activate({existing: inData});
		}), 100);
	},
	handleDelete: function(){
		var username = false;
		if(event.dispatchTarget.username){
			username = event.dispatchTarget.username;
		}else if(event.dispatchTarget.parent.username){
			username = event.dispatchTarget.parent.username;
		}else if(event.dispatchTarget.parent.parent.username){
			username = event.dispatchTarget.parent.parent.username;
		}else if(event.dispatchTarget.parent.parent.parent.username){
			username = event.dispatchTarget.parent.parent.parent.username;
		}
		console.log(event.dispatchTarget);
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
