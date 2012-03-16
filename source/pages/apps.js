enyo.kind({
	name: "appsPage",
	kind: "Page",
	components: [
		{kind: "Book", components: [
			{name: "picker", components: [
				{classes: "hero-unit", components: [
					{tag: "h1", content: "Welcome to Apps"},
					{tag: "p", content: "We're working on getting some of your favorite apps ready to use right here. In the mean time, check out some of the apps we've prepared for you."},
				]},
				{tag: "ul", classes: "thumbnails", components: [
					{tag: "li", classes: "span3", onclick: "openApp", components: [
						{classes: "thumbnail", components: [
							{tag: "img", src: "source/img/chatIcon.png"},
							{classes: "caption", components: [
								{tag: "h3", content: "Villo Chat"},
								{tag: "p", content: "Villo Chat is a very simple chatroom application, built for the Enyo Hackathon."},
								{tag: "p", components: [
									{kind: "bootstrap.Button", content: "Open", type: "primary"},
								]}
							]}
						]}
					]},
					/*
					{tag: "li", classes: "span3", components: [
						{classes: "thumbnail", components: [
							{tag: "img", src: "source/img/chatIcon.png"}
						]}
					]},
					{tag: "li", classes: "span3", components: [
						{classes: "thumbnail", components: [
							{tag: "img", src: "source/img/chatIcon.png"}
						]}
					]},
					{tag: "li", classes: "span3", components: [
						{classes: "thumbnail", components: [
							{tag: "img", src: "source/img/chatIcon.png"}
						]}
					]},
					*/
				]}
			]},
			{name: "player", kind: "appPlayer"}
		]}
	],
	
	openApp: function(){
		this.$.book.pageName("player");
		this.$.player.activate();
	},
	
	activate: function(){
		this.$.book.pageName("picker");
	}
});

enyo.kind({
	name: "appPlayer",
	kind: "Page",
	components: [
		{tag: "form", name: "form", attributes: {"action": "http://villo.me/main/integrated/medium.php", "method": "post", "target": "app_frame"}, components: [
			{tag: "input", attributes: {"type": "hidden", "name": "appname"}},
			{tag: "input", attributes: {"type": "hidden", "name": "appid"}},
			{tag: "input", attributes: {"type": "hidden", "name": "appurl"}},
			{tag: "input", attributes: {"type": "hidden", "name": "villo_username"}},
			{tag: "input", attributes: {"type": "hidden", "name": "villo_token"}},
			{tag: "input", attributes: {"type": "hidden", "name": "apikey"}},
		]},
		{name: "frame", tag: "iframe", attributes: {"scrolling": "no", "seamless": "seamless", "frameborder": "0", "name": "app_frame"}}
	],
	create: function(){
		this.inherited(arguments);
	},
	rendered: function(){
		this.inherited(arguments);
	},
	activate: function(){
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