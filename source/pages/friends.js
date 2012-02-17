enyo.kind({
	name: "friendsPage",
	kind: "Page",
	components: [
		{classes: "hero-unit", components: [
			{tag: "h1", content: "Welcome to Friends"},
			{tag: "p", content: "Your favorite cloud service, better than ever. Villo 1.0 is coming soon, and it adds in tons of new features for developers and users alike. Not only will we bringing you a new version of Villo, we're also going to launch a brand new user website, and developer portal. We hope you like it."},
			{tag: "p", components: [
				{content: "Learn More", tag: "a", classes: "btn btn-primary btn-large", attributes: {"href": "http://villo.net/more/"}}
			]}
		]},
	]
})