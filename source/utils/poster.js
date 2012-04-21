/*
 * Generic Posting kind:
 */
enyo.kind({
	name: "Poster",
	kind: "Control",
	published: {
		"placeholder": "Share a new post...",
		"content": "",
		"width": "460px",
		"small": false,
		"share": false,
		"repost": false,
		"cancel": true
	},
	events: {
		onPostDone: ""
	},
	expanded: false,
	style: "margin-bottom: 0px;",
	components: [
		{name: "small", showing: false, components: [
			{kind: "bootstrap.Button", name: "smallButton", content: "New Post", classes: "pull-right", icon: "edit"},
		]},
		{name: "full", showing: true, classes: "row-fluid", components: [
			{classes: "span2", components: [
				{classes: "thumbnail", name: "avatar", style: "height: 58px; width: 58px;", tag: "img", src: ""}
			]},
			{classes: "span10", components: [
				{name: "placeholder", classes: "well", style: "margin-bottom: 0px;", showing: true, onclick: "swapView", components: [
					{tag: "input", name: "input", classes: "input-large", style: "margin-bottom: 0px;"},
					{kind: "bootstrap.Button", content: "New Post", classes: "pull-right", icon: "edit"},
				]},
				{tag: "form", showing: false, name: "form", style: "margin-bottom: 0px;", classes: "well", components: [
					{classes: "close", name: "closeButton", tag: "a", allowHtml: true, content: "&times;", style: "height: 0px; margin-top: -15px; margin-right: -15px;", onclick: "swapView"},
					{kind: "TextArea", name: "area", classes: "input-xlarge", style: "resize: none; width: 330px;"},
					{classes: "pull-left", components: [
						{kind: "bootstrap.Button", name: "cancelButton", showing: false, name: "cancelButton", content: "Cancel", onclick: "cancelIt"},
					]},
					{classes: "pull-right", components: [
						{kind: "bootstrap.Button", name: "postButton", type: "primary", content: "Post", onclick: "postItem"},
					]},
					//Floats screw up heights, so we manually add the padding:
					{style: "height: 20px;"}
				]}
			]},
		]}
	],
	create: function(){
		this.inherited(arguments);
		if(this.small === true){
			this.$.full.setShowing(false);
			this.$.small.setShowing(true);
		}else{
			this.$.full.setShowing(true);
			this.$.small.setShowing(false);
		}
		
		if(this.share === true){
			this.$.smallButton.props({content: "Share", icon: "share"});
		}
		
		if(this.repost === true){
			this.$.area.addClass("disabled");
			this.$.area.setAttribute("disabled", true);
			this.$.postButton.props({content: "Repost"});
		}
		
		if(this.cancel === false){
			this.$.closeButton.setShowing(false);
			this.$.cancelButton.setShowing(true);
		}
	},
	replaceContent: function(inSender){
		this.content = inSender;
		this.$.area.setValue(this.content);
	},
	cancelIt: function(){
		this.bubble("onPostDone");
		if(this.repost === true){
		}else{
			this.swapView()
		}
	},
	rendered: function(){
		this.inherited(arguments);
		
		this.$.input.setAttribute("placeholder", this.placeholder);
		this.$.area.setAttribute("placeholder", this.placeholder);
		
		if(this.content !== "" && this.small === false){
			this.$.area.setValue(this.content);
			this.swapView();
		};
		
		this.applyStyle("width", this.width);
		
		this.$.avatar.setSrc("https://api.villo.me/avatar.php?thumbnail=true&username=" + escape(villo.user.getUsername()));
	},
	swapView: function(){
		if(this.expanded === false){
			this.expanded = true;
			this.$.placeholder.setShowing(false);
			this.$.form.setShowing(true);
			this.$.area.hasNode().focus();
		}else{
			this.expanded = false;
			this.$.area.setValue("");
			this.$.area.hasNode().blur();
			this.$.placeholder.setShowing(true);
			this.$.form.setShowing(false);
		}
	},
	postItem: function(){
		this.$.postButton.startLoad("Posting...");
		villo.feeds.post({
			action: "user-post",
			description: this.$.area.getValue(),
			callback: enyo.bind(this, function(){
				this.$.postButton.reset();
				this.$.area.setValue("");
				if(this.repost !== true){
					this.swapView();
				}
				this.bubble("onPostDone");
			})
		});
	}
});