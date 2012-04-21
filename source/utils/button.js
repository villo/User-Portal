enyo.kind({
	name: "bootstrap.Button",
	kind: "Control",
	classes: "btn",
	published: {
		type: "",
		icon: "",
		disabled: false,
		content: "Button",
		white: false,
		disabled: false,
		forceType: ""
	},
	handlers: {
		onclick: "handleClick"
	},
	components: [
		{name: "icon", tag: "i"},
		{name: "content", tag: "span", content: ""}
	],
	create: function(){
		this.inherited(arguments);
		if(this.type !== ""){
			this.addClass("btn-" + this.type);
		}
		if(this.icon !== ""){
			this.$.icon.addClass("icon-" + this.icon);
			//Add space:
			this.content = " " + this.content;
		}
		if(this.white === true){
			this.$.icon.addClass("icon-white");
		}
		if(this.disabled === true){
			this.addClass("disabled");
		}
		if(this.forceType !== ""){
			this.setAttribute("type", this.forceType);
		}
		
		this.$.content.setContent(this.content);
	},
	loading: function(inSender){
		//Push off to the startLoad method:
		this.startLoad(inSender);
	},
	startLoad: function(inSender){
		//We use our own loading text system:
		//Bootstrap's is cool, but doesn't support icons, and the reset function is fussy.
		if(this.icon !== ""){
			inSender = " " + inSender;
		}
		this.$.content.setContent(inSender);
		this.disable();
	},
	reset: function(){
		if(this.icon !== ""){
			this.content = " " + this.content;
		}
		this.$.content.setContent(this.content);
		this.enable();
	},
	handleClick: function(){
		//Block click events if the button is disabled:
		if(this.hasClass("disabled")){
			return true;
		}
	},
	disable: function(){
		this.addClass("disabled");
	},
	enable: function(){
		this.removeClass("disabled");
	}
});


enyo.kind({
	name: "bootstrap.Radio",
	kind: "Control",
	classes: "btn-group",
	published: {
		type: "",
		wide: false
	},
	attributes: {
		"data-toggle": "buttons-radio"
	},
	events: {
		onChange: ""
	},
	defaultKind: "bootstrap.Button",
	handlers: {
		onclick: "handleClick"
	},
	initComponents: function(){
		//We steal the components:
		for(x in this.components){
			if(this.components.hasOwnProperty(x)){
				if(this.type !== ""){
					this.components[x].classes += " btn-" + this.type;
				}
				if(this.wide === true){
					this.components[x].style += "; min-width: 50px; ";
				}
				if(this.components[x].selected && this.components[x].selected === true){
					this.components[x].classes += " active";
				}
				this.createComponent(this.components[x]);
				delete this.components[x];
			}
		}
		this.inherited(arguments);
	},
	handleClick: function(inSender){
		this.bubble("onChange", inSender);
	},
	setSelected: function(inName){
		for(var x in this.$){
			if(this.$.hasOwnProperty(x)){
				if(this.$[x].name === inName){
					this.$[x].addClass("active");
				}else{
					this.$[x].removeClass("active");
				}
				this.render();
			}
		}
	}
})
