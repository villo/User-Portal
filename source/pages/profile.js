/*
 * Generic profile page.
 * 
 * You can pass params to the activate function, which will in turn update the content.
 * 
 * If no params are passed, then it will assume that you want to view your own profile.
 */
enyo.kind({
	name: "profilePage",
	kind: "Page",
	components: [
		{kind: "Control", name: "alert"},
		{classes: "row", components: [
			//Left Side:
			{classes: "span4", name: "left", components: [
				//Avatar:
				{style: "height: 300px; background-size: 100%; background-repeat: no-repeat;", name: "profileAvatar", /*onmouseover: "showResize", onmouseout: "hideResize",*/ components: [
					
					//Uncomment to allow profile resizing: 
					
					//{name: "resize", showing: false, classes: "pull-right", style: "opacity: 1; background-color: #fff; padding: 5px;", onclick: "expandAvatar", components: [
					//{tag: "a", name: "resizeIcon", classes: "pull-right icon-resize-full"}
					//]},
					
				]},	
				
				//Slight spacing
				{content: "<br />"},
				
				//Button Controls:
				{classes: "pull-left", components: [
					{kind: "bootstrap.Button", name: "profileAddFriend", icon: "plus", disabled: true, white: true, content: "Add Friend", type: "primary", onclick: "addFriend"},
				]},
				{classes: "pull-right", components: [
					{kind: "bootstrap.Button", icon: "envelope", content: "Message"},
				]},
				{tag: "br"},
				{tag: "br"},
				{classes: "pull-left", components: [
					{kind: "bootstrap.Button", icon: "th-large", content: "Apps"},
				]},
				{classes: "pull-right", components: [
					{kind: "bootstrap.Button", icon: "th-list", content: "Activity"},
				]},
				
			]},
			//Right Side:
			{classes: "span8", name: "right", components: [
				
				{tag: "a", showing: false, name: "editProfileButton", classes: "btn pull-right", onclick: "editProfile", components: [
					{tag: "i", classes: "icon-pencil"},
					{tag: "span", content: " Edit Profile"}
				]},
				
				{tag: "h1", content: "", name: "profileUsername"},
				{content: "", name: "profileFullName"},
				{content: "<br />"},
				{classes: "well", name: "profileBio", content: ""},
				{content: "", name: "profileLocation"},
			]}
		]},
		{kind: "editProfile"}
	],
	create: function(){
		this.inherited(arguments);
	},
	activate: function(inSender){
		this.clearBody()
		if(inSender && inSender.page){
			if(inSender.data === ""){
				//Just load our own profile.
				villo.profile.get({
					callback: enyo.bind(enyo.bind(this, this.gotProfile))
				});
			}else{
				//Check to make sure that we got a username. Sometime we may be talky, but we don't want to show log info as a user. 
				if(inSender.data.username){
					villo.profile.get({
						username: inSender.data.username,
						callback: enyo.bind(enyo.bind(this, this.gotProfile))
					});
				}else{
					//They still called activate, so let's show our own profile.
					villo.profile.get({
						callback: enyo.bind(enyo.bind(this, this.gotProfile))
					});
				}
			}
		}else{
			//Just assume that they want to see their own profile.
			villo.profile.get({
				callback: enyo.bind(enyo.bind(this, this.gotProfile))
			});
		}
	},
	clearBody: function(){
		this.$.profileUsername.setContent("");
		this.$.profileFullName.setContent("");
		this.$.profileLocation.setContent("");
		this.$.profileBio.setContent("");
		this.$.profileAvatar.addStyles("background-image: url('source/img/ajax-loader-profile.gif')");
		this.$.profileAddFriend.disable();
		this.$.editProfileButton.setShowing(false);
	},
	gotProfile: function(inSender){
		if(inSender && inSender.profile){
			/*
			 * We got a profile, so let's use it.
			 */
			var profile = inSender.profile[0];
			this.$.profileUsername.setContent(profile.username);
			this.$.profileFullName.setContent((profile.firstname || "") + " " + (profile.lastname || ""));
			this.$.profileLocation.setContent("Location: " + profile.location);
			this.$.profileBio.setContent(profile.status.replace(/\n/gi, "<br />") || "");
			
			this.$.profileAvatar.addStyles("background-image: url(https://api.villo.me/avatar.php?username=" + profile.username + ")");
			
			if(villo.user.username.toLowerCase() === profile.username.toLowerCase()){
				this.$.editProfileButton.setShowing(true);
			}else{
				this.$.editProfileButton.setShowing(false);
			}
			this.$.profileAddFriend.reset();
			if(profile.friend === true){
				this.$.profileAddFriend.disable();
			}else{
				this.$.profileAddFriend.enable();
			}
		}else{
			/*
			 * Add a new alert:
			 */
			this.$.alert.createComponent({kind: "Alert", type: "error", title: "Error Loading Profile", content: "An unknown error occured while loading the profile. Please try again later.", clearOnClose: true});
			this.$.alert.render();
		}
	},
	editProfile: function(){
		this.$.editProfile.open();
	},
	
	/*
	 * Button actions:
	 */
	
	addFriend: function(inSender){
		//Change button state:
		inSender.startLoad("Adding Friend...");
		var friendToAdd = this.$.profileUsername.getContent();
		villo.friends.add({
			username: friendToAdd,
			callback: enyo.bind(this, function(f){
				if(f && f.friends){
					inSender.reset();
					inSender.disable();
					this.$.alert.createComponent({kind: "Alert", type: "info", title: "Friend Added", content: "You have added " + friendToAdd + " to your friends list!", clearOnClose: true});
				this.$.alert.render();
				}
			})
		});
	},
	
	
	
	
	/*
	 * Avatar viewer:
	 */
	showResize: function(){
		this.$.resize.setShowing(true);
	},
	hideResize: function(){
		this.$.resize.setShowing(false);
	},
	expandAvatar: function(){
		if(this.$.right.hasClass("span8")){
			//Remove existing classes:
			this.$.right.removeClass("span8");
			this.$.left.removeClass("span4");
			//Add new classes:
			this.$.right.addClass("span6");
			this.$.left.addClass("span6");
			//Adjust height of avatar:
			this.$.profileAvatar.applyStyle("height",  "460px;");
			//Swap the icons:
			this.$.resizeIcon.removeClass("icon-resize-full");
			this.$.resizeIcon.addClass("icon-resize-small");
		}else{
			//Remove existing classes:
			this.$.right.removeClass("span6");
			this.$.left.removeClass("span6");
			//Add new classes:
			this.$.right.addClass("span8");
			this.$.left.addClass("span4");
			//Adjust height of avatar:
			this.$.profileAvatar.applyStyle("height", "300px");
			//Swap the icons:
			this.$.resizeIcon.removeClass("icon-resize-small");
			this.$.resizeIcon.addClass("icon-resize-full");
		}
		//this.$.avatarViewer.show();
	},
});

/*
 * This opens up the controls for editing the profile.
 * 
 * The nice thing about this is that you can include this kind anywhere and then load it up. Modularity FTW.
 */
enyo.kind({
	name: "editProfile",
	kind: "Control",
	components: [
		{kind: "Modal", keyboard: true, components: [
			{kind: "ModalHeader", content: "Edit Profile", closeButton: true},
			{kind: "ModalBody", components: [
				{content: "Coming soon"}
			]},
			{kind: "ModalFooter", components: [
				{classes: "pull-right", components: [
					{tag: "a", classes: "btn btn-primary", content: "Save Changes"},
					{tag: "a", classes: "btn", content: "Cancel", onclick: "close"}
				]}
			]}
		]}
	],
	
	open: function(){
		this.$.modal.show();
	},
	
	close: function(){
		this.$.modal.hide();
	}
})
