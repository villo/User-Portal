enyo.kind({
	name: "appsPage",
	kind: "Page",
	apps: [
		{
			//Info for the visual aspects:
			name: "Villo Chat",
			icon: "source/img/chatIcon.png",
			description: "Villo Chat is a very simple chatroom application, built for the Enyo Hackathon.",
			
			//Info for Villo to move around:
			_api: "39929f283058e6b1a46d93e586697068",
			_appid: "me.villo.integrated.chat",
			_appurl: ""
		},
		{
			//Info for the visual aspects:
			name: "Darts HD",
			icon: "source/img/chatIcon.png",
			description: "Villo Chat is a very simple chatroom application, built for the Enyo Hackathon.",
			
			//Info for Villo to move around:
			_api: "e03ad0289163b86669d9ac6e31892069",
			_appid: "me.villo.apps.darts",
			_appurl: "http://villo.me/main/integrated/apps/weather/index.html"
		},
	],
	components: [
		{kind: "Book", components: [
			{name: "picker", components: [
				{classes: "hero-unit", components: [
					{tag: "h1", content: "Welcome to Apps"},
					{tag: "p", content: "We're working on getting some of your favorite apps ready to use right here. In the mean time, check out some of the apps we've prepared for you."},
				]},
				{tag: "ul", name: "featuredApps", classes: "thumbnails", onOpenApp: "openApp", components: [
				
				]}
			]},
			{name: "player", kind: "appPlayer"}
		]}
	],
	rendered: function(){
		this.inherited(arguments);
		for(var x in this.apps){
			if(this.apps.hasOwnProperty(x)){
				this.$.featuredApps.createComponent({kind: "appFeature", data: this.apps[x]});
			}
		}
		this.$.featuredApps.render();
	},
	openApp: function(inSender, inEvent){
		this.$.book.pageName("player");
		this.$.player.activate(inEvent);
	},
	activate: function(){
		this.$.book.pageName("picker");
	}
});

enyo.kind({
	name: "appFeature",
	kind: "Control",
	tag: "li",
	classes: "span3",
	published: {
		data: {}
	},
	handlers: {
		onclick: "manageOpenApp"
	},
	events: {
		onOpenApp: ""
	},
	components: [
		{classes: "thumbnail", components: [
			{tag: "img", name: "icon", src: ""},
			{classes: "caption", components: [
				{tag: "h3", name: "name", content: ""},
				{tag: "p", name: "desc", content: ""},
				{tag: "p", components: [
					{kind: "bootstrap.Button", content: "Open", type: "primary"},
				]}
			]}
		]}
	],
	create: function(){
		this.inherited(arguments);
		this.$.icon.setSrc(this.data.icon);
		this.$.name.setContent(this.data.name);
		this.$.desc.setContent(this.data.description);
	},
	manageOpenApp: function(){
		this.bubble("onOpenApp", this.data);
	}
});

enyo.kind({
	name: "appPlayer",
	kind: "Page",
	components: [
		{tag: "form", name: "form", attributes: {"action": "http://villo.me/main/integrated/medium.php?origin=" + escape(document.domain), "method": "post", "target": "app_frame", "name": "form_medium"}, components: [
			{tag: "input", name: "appname", attributes: {"type": "hidden", "name": "appname"}},
			{tag: "input", name: "appid", attributes: {"type": "hidden", "name": "appid"}},
			{tag: "input", name: "appurl", attributes: {"type": "hidden", "name": "appurl"}},
			{tag: "input", name: "username", attributes: {"type": "hidden", "name": "villo_username"}},
			{tag: "input", name: "token", attributes: {"type": "hidden", "name": "villo_token"}},
			{tag: "input", name: "apikey", attributes: {"type": "hidden", "name": "apikey"}},
		]},
		{name: "frame", tag: "iframe", style: "width: 940px; height: 700px;", attributes: {"scrolling": "no", "seamless": "seamless", "frameborder": "0", "name": "app_frame", "sandbox": "allow-forms allow-same-origin allow-scripts", "": ""}}
	],
	create: function(){
		this.inherited(arguments);
	},
	rendered: function(){
		this.inherited(arguments);
	},
	activate: function(inSender){
		this.$.appname.setAttribute("value", inSender.name);
		this.$.appid.setAttribute("value", inSender._appid);
		this.$.appurl.setAttribute("value", inSender._appurl);
		this.$.apikey.setAttribute("value", inSender._api);
		this.$.username.setAttribute("value", villo.user.username);
		this.$.token.setAttribute("value", villo.user.token);
		
		this.$.form.hasNode();
		this.$.form.node.submit();
	}
});
/*
<form action="integrated/medium.php" name="medium_form" method="post" target="app_frame_setme">

		<input type="hidden" name="appname" value="" />

		<input type="hidden" name="appid" value="" />

		<input type="hidden" name="appurl" value="" />

		<input type="hidden" name="villo_username" value="" />

		<input type="hidden" name="villo_token" value="" />

		<input type="hidden" name="apikey" value="" />

	</form>

	<iframe src="" id="app_frame_setme" name="app_frame_setme" class="app_frame" seamless="seamless" scrolling="no" frameborder="0" width="800" height="600">
*/