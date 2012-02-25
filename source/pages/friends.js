enyo.kind({
	name: "friendsPage",
	kind: "Page",
	events: {
		onFriendClicked: ""
	},
	components: [
		{tag: "a", showing: true, name: "editProfileButton", classes: "btn btn-primary pull-right", onclick: "editProfile", components: [
			{tag: "i", classes: "icon-plus icon-white"},
			{tag: "span", content: " Add Friend"}
		]},
		//Lazy way to do this, but it works
		{content: "<br /><br />"},
		
		//We no longer really use this alert box.
		//{kind: "Alert", content: 'You can add a friend by searching for their profile, then pressing the "Add Friend" button.', type: "info"},
		
		{kind: "friendsModule", columns: 3, onclick: "handleFriendClick"}
	],
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
			//Probably a space click.
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
	components: [
		//
		//TODO
		//For some reason it didn't save the progress on the grid, so we're going to have to redo that.
		//
		{tag: "ul", classes: "thumbnails", name: "renderBlock"}
	],
	columnSpan: null,
	itemsRendered: 0,
	
	create: function(){
		this.inherited(arguments);
		
		//Set up number of columns:
		this.columnSpan = Math.floor(12 / this.columns);
		villo.friends.get({
			callback: enyo.bind(this, this.getFriends)
		});
	},
	getFriends: function(inSender){
		if(inSender && inSender.friends){
			enyo.forEach(inSender.friends, this.renderFriends, this);
		}
		
		this.$.renderBlock.render();
	},
	renderFriends: function(inSender){
		if(this.itemsRendered < this.limit){
			this.$.renderBlock.createComponent({kind: "friendsItem", classes: "span" + this.columnSpan, username: inSender});
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
	components: [
		{tag: "a", classes: "thumbnail", onmouseover: "itemHover", onmouseout: "itemHoverOut", style: "text-decoration: none;", components: [
			{tag: "span", name: "exitFriend", showing: false, classes: "pull-right close", content: "&times;", onclick: "deleteFriend"},
			{name: "avatar", tag: "img"},
			{name: "username", content: "", tag: "h3", style: "text-align: center;"}
		]},
		{kind: "Modal", onclick: "stopTheProp", keyboard: true, background: false, components: [
			{kind: "ModalHeader", content: "Delete Friend?"},
			{kind: "ModalBody", content: "Are you sure you want to delete your friend USERNAME?"},
			{kind: "ModalFooter", components: [
				{tag: "a", classes: "btn btn-danger", content: "Delete Friend"},
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
	handleDelete: function(){
		this.$.modal.show();
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
