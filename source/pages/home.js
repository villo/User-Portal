enyo.kind({
	name: "homePage",
	kind: "Page",
	components: [
		{classes: "hero-unit", components: [
			{tag: "h1", content: "Welcome to Villo"},
			{tag: "p", content: "Your favorite cloud service, better than ever. Villo 1.0 is coming soon, and it adds in tons of new features for developers and users alike. Not only will we bringing you a new version of Villo, we're also going to launch a brand new user website, and developer portal. We hope you like it."},
			/*
			
			{tag: "p", components: [
				{content: "Learn More", tag: "a", classes: "btn btn-primary btn-large", attributes: {"href": "http://villo.net/more/"}}
			]}
			*/
		]},
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
	]
})
