enyo.kind({
	name: "welcomePage",
	kind: "Page",
	components: [
		{classes: "hero-unit", components: [
			{tag: "h1", content: "Welcome to Villo"},
			{tag: "p", content: "Welcome to the new Villo. We're currently celebrating the launch of our new website, which we're very excited about. Thank you to our loyal developers and users. If you're new here, welcome! We invite you to our community."},
			
			{tag: "p", components: [
				{content: "Get Started", tag: "a", classes: "btn btn-primary btn-large", onclick: "moveOn"}
			]}
		]},
		/*
		{classes: "row", components: [
			{classes: "span6", components: [
				{tag: "h2", content: "Developers"},
				{tag: "p", content: "Interested in creating your own Villo-Enabled applications? Get started by visiting the developer portal, and creating an account. There are several tools to help you get started, and if you need help, just <a href='mailto:jordan@villo.me'>contact us</a>!"},
				{tag: "a", attributes: {href: "http://dev.villo.me"}, classes: "btn", content: "Developer Site"}
			]},
			{classes: "span6", components: [
				{tag: "h2", content: "Users"},
				{tag: "p", content: "There are already several applications which are powered by Villo services. You can use the user portal to manage you Villo account, and see what others are up to on Villo!"},
				{tag: "a", attributes: {href: "http://villo.me/main/"}, classes: "btn", content: "User Site"}
			]}
		]},
		*/
	],
	
	moveOn: function(){
		//We could bubble an event up, but we don't need to deligate anything, so we're just going to call the parent (book).
		this.parent.pageName("homePage");
	}
})
