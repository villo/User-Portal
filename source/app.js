enyo.kind({
	name: "App",
	kind: "Control",
	components: [
		{kind: "header", onPageChange: "pageChange"},
		{kind: "body", name: "Body", onLoggedIn: "bubbleLogin"}
	],
	
	pageChange: function(inSender, inEvent){
		this.$.Body.pageChange(inEvent);
	},
	
	rendered: function(){
		this.inherited(arguments);
		if(villo.user.isLoggedIn() !== true){
			//Show the login page.
			this.$.Body.$.loginPage.showLoginModal();
		}else{
			this.loggedIn();
		}
	},
	
	/*
	 * The event has now been bubbled up multiple levels, and we'll now dispatch it as such.
	 * 
	 * In Enyo 2.0.1, we may need to change the bubbling to fit the new event model.
	 * 
	 */
	bubbleLogin: function(){
		this.loggedIn();
	},
	
	loggedIn: function(){
		this.$.header.loggedIn();
	}
});