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
				
				{tag: "a", classes: "btn pull-right", components: [
					{tag: "i", classes: "icon-pencil"},
					{tag: "span", content: " Edit Profile"}
				]},
				
				{tag: "h1", content: "", name: "profileUsername"},
				{content: "", name: "profileFullName"},
				{classes: "well", name: "profileBio", content: ""},
				{content: "", name: "profileLocation"},
			]}
		]},
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
				
			}
		}else{
			//Just assume that they want to see their own profile.
		}
	},
	gotProfile: function(inSender){
		if(inSender && inSender.profile){
			var profile = inSender.profile[0];
			console.log(profile);
			this.$.profileUsername.setContent(profile.username);
			this.$.profileFullName.setContent((profile.firstname || "") + " " + (profile.lastname || ""));
			this.$.profileLocation.setContent("Location: " + profile.location);
			this.$.profileBio.setContent(profile.status.replace(/\n/gi, "<br />") || "");
			console.log()
			
			this.$.profileAvatar.setAttribute("src", "https://api.villo.me/avatar.php?username=" + profile.username);
		}else{
			/*
			 * Add a new alert:
			 */
			this.$.alert.createComponent({kind: "alert", type: "error", title: "Error Loading Profile", content: "An unknown error occured while loading the profile. Please try again later.", clearOnClose: true});
			this.$.alert.render();
		}
	}
})
