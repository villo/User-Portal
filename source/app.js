enyo.kind({
	name: "App",
	kind: "Control",
	components: [
		{kind: "header", onPageChange: "pageChange"},
		{kind: "body", name: "Body", onLoggedIn: "bubbleLogin"},
		
		//PageManager, which pushes events when a new page hash is supplied:
		{kind: "pageManager", name: "hasher", onHashLoad: "hashChange", keys: true}
	],
	
	pageChange: function(inSender, inEvent){
		this.$.Body.pageChange(inEvent);
	},
	
	hashChange: function(inSender, inEvent){
		/*
		 * NOTE: 
		 * This function is only called when the page is first loaded.
		 */
		if(inEvent && inEvent.page){
			if(inEvent["_first"] && inEvent["_first"] === true){
				//Still do it.
				delete inEvent["_first"];
				this.$.Body.pageChange(inEvent);
			}else{
				//Don't change the page. Internal change.
			}
		}
	},
	
	rendered: function(){
		this.inherited(arguments);
		if(villo.user.isLoggedIn() !== true){
			//Show the login page.
			this.$.Body.$.loginPage.showLoginModal();
		}else{
			this.loggedIn();
			if(villo.settings.load({instant: true})){
				
			}else{
				var settings = {
					hashPages: true,
					appStates: true
				};
				villo.settings.save({
					settings: settings,
					instant: true
				});
			}
		}
	},
	
	/*
	 * The event has now been bubbled up multiple levels, and we'll now dispatch it as such.
	 * 
	 * In Enyo 2.0.1, we may need to change the bubbling to fit the new event model.
	 * 
	 */
	bubbleLogin: function(){
		this.loggedIn();
	},
	
	loggedIn: function(){
		this.$.header.loggedIn();
	}
});

enyo.kind({
	name: "pageManager",
	type: "Control",
	published: {
		//Set to true if you want a piece of json to be returned.
		keys: false,
		
		//Set the spliter between variables:
		split: "&",
		
		//Set to a custom separator between keys and pairs:
		separator: "=",
	},
	latestHash: "",
	events: {
		//Create an event that you can hook into to listen to hash changes.
		onHashChange: "",
		//Event is called when the hash is loaded:
		onHashLoad: ""
	},
	create: function(){
		this.inherited(arguments);
		//Check for window:
		if(window){
			//Bind the event change to the hashChange function:
			window.onhashchange = enyo.bind(this, this.hashChange);
		}
	},
	rendered: function(){
		this.inherited(arguments);
		//Check for page hash when the control is rendered:
		this.hashChange(true);
	},
	hashChange: function(first){
		var hash = window.location.hash || "";
		if(hash === this.latestHash || hash === "" || hash === "#"){
			//Don't do anything,
		}else{
			//Store hash to the latest hash:
			this.latestHash = hash;
			
			//Ditch the "#":
			hash = hash.substring(1);
			
			if(this.keys === true){
				//Create a JSON object to pass back:
				var passBack = {};
				
				splitHash = hash.split(this.split);
				for(var x in splitHash){
					if(splitHash.hasOwnProperty(x)){
						shatteredHash = splitHash[x].split(this.separator);
						
						//Check to make sure the hash was formatted with only one separator:
						if(shatteredHash.length === 2){
							passBack[shatteredHash[0]] = JSON.parse(shatteredHash[1]);
						}else{
							//Let's just not do anything.
						}
					}
				}
				
				//Pass first, so they can handle first page loads differently: 
				if(first === true){
					passBack["_first"] = true;
					this.bubble("onHashLoad", passBack);
				}
				
				//Bubble the event back up with the keys:
				this.bubble("onHashChange", passBack);
			}else{
				//No more work to do, just bubble the event with the hash:
				this.bubble("onHashChange", hash);
			}
		}
	}
});
