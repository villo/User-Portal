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
			{classes: "span4", components: [
				{style: "height: 250px; width: 250px;", components: [
					{tag: "img", name: "profileAvatar", attributes: {"src": ""}}
				]}
			]},
			{classes: "span8", components: [
				
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
		}
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
			
			this.$.profileAvatar.setAttribute("src", "https://api.villo.me/avatar.php?username=" + profile.username);
			
			if(villo.user.username.toLowerCase() === profile.username.toLowerCase()){
				this.$.editProfileButton.setShowing(true);
			}else{
				this.$.editProfileButton.setShowing(false);
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
	}
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
