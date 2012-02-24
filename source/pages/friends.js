enyo.kind({
	name: "friendsPage",
	kind: "Page",
	components: [
		{kind: "Alert", content: 'You can add a friend by searching for their profile, then pressing the "Add Friend" button.', type: "info"},
		{kind: "friendsModule", columns: 3}
	]
});

enyo.kind({
	name: "friendsModule",
	kind: "Control",
	classes: "row",
	published: {
		columns : 4
	},
	components: [
	],
	columnSpan: null,
	
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
		
		this.render();
	},
	renderFriends: function(inSender){
		this.createComponent({kind: "friendsItem", classes: "span" + this.columnSpan, username: inSender});
	}
});

enyo.kind({
	name: "friendsItem",
	kind: "Control",
	published: {
		username: ""
	},
	components: [
		{name: "username", content: ""}
	],
	create: function(){
		this.inherited(arguments);
		
		this.$.username.setContent(this.username);
	}
});
