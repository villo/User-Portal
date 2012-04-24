enyo.kind({
	name: "settingsPage",
	kind: "Control",
	cloneSettings: {},
	components: [
		{kind: "Modal", keyboard: true, components: [
			{kind: "ModalBody", components: [
				{tag: "ul", classes: "nav nav-pills", components: [
					{tag: "li", name: "settingsChoose", onclick: "changeSelection", page: "settings", classes :"active", components: [
						{tag: "a", content: "Website Settings"}
					]},
					{tag: "li", name: "appsChoose", onclick: "changeSelection", page: "apps", components: [
						{tag: "a", content: "My Apps"}
					]},
					{tag: "a", name: "closeButton", classes: "close", attributes: {"data-dismiss": "modal"}, content: "&times;", allowHtml: true},
				]},
				{tag: "hr"},
				{kind: "Book", name: "book", components: [
					{name: "settingsSelection", components: [
						{classes: "form-horizontal", style: "padding-left: 70px;", components: [
							{classes: "control-group", components: [
								{tag: "label", classes: "control-label", components: [
									{classes: "thumbnail pull-right", style: "height: 64px; width: 64px;", components: [
										{tag: "img", name: "accountAvatar", src: "http://placehold.it/64x64"}
									]},
								]},
								{classes: "controls", components:[
									{tag: "h3", style: "padding-top: 15px;", content: "Kesne"},
									{tag: "a", content: "Logout", onclick: "logout"}
								]},
							]},
							{classes: "control-group", components: [
								{tag: "label", classes: "control-label", content: "Hash Pages"},
								{classes: "controls", components:[
									{kind: "bootstrap.Radio", onChange: "changeHash", name: "radioHash", type: "", wide: true, components: [
										{content: "On", name: "on", value: true},
										{content: "Off", name: "off", value: false}
									]},
								]},
							]},
							{classes: "control-group", components: [
								{tag: "label", classes: "control-label", content: "App States"},
								{classes: "controls", components:[
									{kind: "bootstrap.Radio", onChange: "changeStates", name: "radioStates", type: "", wide: true, components: [
										{content: "On", name: "on", value: true},
										{content: "Off", name: "off", value: false}
									]},
								]},
							]}
						]}
					]},
					{name: "appsSelection", components: [
						{content: "My Apps"}
					]}
				]}
			]},
			{kind: "ModalFooter", components: [
				{classes: "pull-right", components: [
					{tag: "a", classes: "btn btn-primary", content: "Save Changes", onclick: "save"},
					{tag: "a", classes: "btn", content: "Cancel", onclick: "close"}
				]}
			]}
		]}
	],
	
	changeStates: function(inSender, inEvent){
		this.cloneSettings.appStates = inEvent.value;
	},
	
	changeHash: function(inSender, inEvent){
		this.cloneSettings.hashPages = inEvent.value;
	},
	
	open: function(page){
		this.cloneSettings = villo.settings.load({instant: true});
		//Select Hash
		if(this.cloneSettings.hashPages === true){
			this.$.radioHash.setSelected("on");
		}else{
			this.$.radioHash.setSelected("off");
		}
		//Select States
		if(this.cloneSettings.appStates === true){
			this.$.radioStates.setSelected("on");
		}else{
			this.$.radioStates.setSelected("off");
		}
		this.$.accountAvatar.setSrc("https://api.villo.me/avatar.php?thumbnail=true&username=" + escape(villo.user.getUsername()));
		this.$.modal.show();
		
		this.changeSelection({"page": page});
		
	},
	
	changeSelection: function(inSender){
		//Remove classes:
		this.$.appsChoose.removeClass("active");
		this.$.settingsChoose.removeClass("active");
		//Add class:
		this.$[inSender.page + "Choose"].addClass("active");
		//Change page:
		this.$.book.pageName(inSender.page + "Selection");
	},
	
	logout: function(){
		if(villo.user.logout() === true){
			window.location.reload();
		}
	},
	
	close: function(){
		this.$.modal.hide();
	},
	
	save: function(){
		villo.settings.save({
			settings: this.cloneSettings,
			instant: true
		});
		this.close();
	}
})