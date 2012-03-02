/* 
 * Copyright (c) 2012, Villo Services. All rights reserved.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 *    - Redistributions of source code must retain the above copyright notice, 
 *      this list of conditions and the following disclaimer.
 *    - Redistributions in binary form must reproduce the above copyright notice, 
 *      this list of conditions and the following disclaimer in the documentation 
 *      and/or other materials provided with the distribution.
 *      
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, 
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY 
 * OF SUCH DAMAGE.
 */

//Establish Namespace
villo = ({});

(function(){
	villo.apiKey = "";
	villo.version = "0.9.7";
})();
/* Villo Analytics */
//TODO: For 1.0 release.

/* Villo Bridge */
(function(){
/*
 * Villo Bridge allows for accelerated Villo development, giving developers a simple method for viewing Villo content.
 */

	
	//TODO: 
	//iFrames?
	//Cross-origin?
	//Security?
	//Pass Div + iFrame set content
	
	
})();

/* Villo Push Chat */
(function(){
	villo.chat = {
		rooms: [],

/**
	villo.chat.join
	==================
	
    Subscribes to messages in a given chat room.
    
	Calling
	-------

	`villo.chat.join({room: string, callback: function, presence: {enabled: boolean})`
	
	- "Room" is the name of the chat room you want to join. Rooms are app-dependent.
	- The "callback" is called when a chat message is received. 
	- The "presence" object contains the "enabled" bool. Setting this to true opens up a presence channel, which tracks the users in a given chatroom. This can also be done with villo.chat.presence.join

	Returns
	-------
		
	Returns true if the chat room has successfully been subscribed to.
		
	Callback
	--------
		
	An object will be passed to the callback function when a message is received in the chat room, and will be formatted like this:
		
		{
			username: "Kesne",
			message: "Hey man, how's it going?"
		}
		
	Use
	---
		
		villo.chat.join({
			room: "main",
			callback: function(message){
				//The message variable is where the goods are.
			}
		});

*/
		join: function(chatObject){
			if ('PUBNUB' in window) {
				if (villo.chat.isSubscribed(chatObject.room) == false) {
					PUBNUB.subscribe({
						channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + chatObject.room.toUpperCase(),
						callback: function(message){
							chatObject.callback(message);
						},
						error: function(e){
							//Error connecting. PubNub will automatically attempt to reconnect.
						}
					});
					
					if(chatObject.presence && chatObject.presence.enabled && chatObject.presence.enabled == true){
						villo.chat.presence.join({
							room: chatObject.room,
							callback: (chatObject.presence.callback || "")
						});
						villo.chat.rooms.push({
							"name": chatObject.room.toUpperCase(),
							"presence": true
						});
					}else{
						villo.chat.rooms.push({
							"name": chatObject.room.toUpperCase(),
							"presence": false
						});
					}
					
					return true;
				} else {
					return true;
				}
			} else {
				return false;
			}
		},
/**
	villo.chat.isSubscribed
	=======================
	
    Determine if you are currently subscribed (connected) to a given chat room.
    
	Calling
	-------

	`villo.chat.isSubscribed(string)`
	
	- The only parameter to be passed is a string containing the room you want to determine the subscription status of.

	Returns
	-------
		
	Returns true if the chat room is currently subscribed to. Returns false if the room is not subscribed to.
		
	Use
	---
		
		villo.chat.isSubscribed("main");

*/

		isSubscribed: function(roomString){
			var c = false;
			for (x in villo.chat.rooms) {
				if (villo.chat.rooms.hasOwnProperty(x)) {
					if (villo.chat.rooms[x].name.toUpperCase() == roomString.toUpperCase()) {
						c = true;
					}
				}
			}
			return c;
		},
/**
	villo.chat.send
	==================
	
    Send a message into any given chat room.
    
	Calling
	-------

	`villo.chat.send({room: string, message: string})`
	
	- "Room" is the name of the chat room you want to join. Rooms are app-dependent, and you cannot send messages accross different applications.
	- The "message" is a string which is a message that you want to send. You can also pass objects in the message parameter, instead of string. 

	Returns
	-------
		
	Returns true if the message was sent. Returns false if an error occurred.
			
	Use
	---
		
		villo.chat.send({
			room: "main",
			message: "Hey man, how's it going?"
		});
		
	Notes
	-----
	
	If you have joined a chat room, when a message is sent, it will be received through the callback defined in the join function call.

*/
		send: function(messageObject){
			if ('PUBNUB' in window) {
				//Build the JSON to push to the server.
				var pushMessage = {
					"username": villo.user.username,
					"message": messageObject.message
				};
				if(!messageObject.room){
					messageObject.room = villo.chat.rooms[0].name;
				}
				PUBNUB.publish({
					channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + messageObject.room.toUpperCase(),
					message: pushMessage
				});
				return true;
			} else {
				return false;
			}
			
		},
/**
	villo.chat.leaveAll
	==================
	
    Closes all of the open connections to chat rooms. If a presence room was joined when the function was loaded, the connection to the presence rooms will also be closed.
    
	Calling
	-------

	`villo.chat.leaveAll()`
	
	Returns
	-------
		
	Returns true if all of the rooms have been disconnected from. 
			
	Use
	---
		
		villo.chat.leaveAll();

*/
		leaveAll: function(){
			if ('PUBNUB' in window) {
				for (x in villo.chat.rooms) {
					if (villo.chat.rooms.hasOwnProperty(x)) {
						PUBNUB.unsubscribe({
							channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + villo.chat.rooms[x].name.toUpperCase()
						});
						if(villo.chat.rooms[x].presence && villo.chat.rooms[x].presence == true){
							villo.chat.presence.leave({
								room: villo.chat.rooms[x].name
							});
						}
					}
				}
				villo.chat.rooms = [];
				return true;
			} else {
				return false;
			}
		},
/**
	villo.chat.leave
	==================
	
    Closes a connection to a specific chat room. If a presence room was joined when the chat room was joined, the connection to the presence room will also be closed.
    
	Calling
	-------

	`villo.chat.leave(string)`
	
	Returns
	-------
		
	Returns true if the room connection was closed. 
			
	Use
	---
		
		villo.chat.leave("main");

*/
		leave: function(closerObject){
			if ('PUBNUB' in window) {
				PUBNUB.unsubscribe({
					channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + closerObject.toUpperCase()
				});
				var x;
				for (x in villo.chat.rooms) {
					if (villo.chat.rooms.hasOwnProperty(x)) {
						if (villo.chat.rooms[x].name == closerObject) {
							var rmv = x;
							if(villo.chat.rooms[x].presence && villo.chat.rooms[x].presence == true){
								villo.chat.presence.leave({
									room: villo.chat.rooms[x].name
								});
							}
						}
					}
				}
				villo.chat.rooms.splice(rmv, 1);
				return true;
			} else {
				return false;
			}
		},
		
/**
	villo.chat.history
	==================
	
    Retrieves recent messages sent in a given room.
    
	Calling
	-------

	`villo.chat.history({room: string, limit: number, callback: function})`
	
	- The "room" string is the name of the chat room you wish to get the history messages of.
	- "limit" is the maximum number of history messages you want to receive. If you do not specify this parameter, it will default to 25.
	- The "callback" function will be called after the messages are received, 
	
	Callback
	--------
		
	An object will be passed to the callback function when the history is loaded, and will be formatted like this:
		
		[{
			username: "Kesne",
			message: "Hey man, how's it going?"
		},{
			username: "someOtherUser",
			message: "Not much, how are you?"
		},{
			username: "Kesne",
			message: "I'm great, thanks for asking!"
		}]
			
	Use
	---
		
		villo.chat.history({
			room: "main",
			limit: 50,
			callback: function(messages){
				//The messages variable holds the object with all of the messages.
			}
		});

*/
		history: function(historyObject){
			if('PUBNUB' in window){
				PUBNUB.history({
					channel: "VILLO/CHAT/" + villo.app.id.toUpperCase() + "/" + historyObject.room.toUpperCase(),
					limit: (historyObject.limit || 25),
					callback: function(data){
						historyObject.callback(data);
					}
				});
			}
		}
	}
	/*
	 * TODO:
	 * Document out the presence APIs.
	 */
	villo.chat.presence = {
			rooms: {},
			
			join: function(joinObject){
				this.rooms[joinObject.room] = {users: []};
				
				this._timeouts[joinObject.room] = {};
				
				PUBNUB.subscribe({
					channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + joinObject.room.toUpperCase() + "",
					callback: function(evt){
						if (evt.name === "user-presence") {
							var user = evt.data.username;
							
							if (villo.chat.presence._timeouts[joinObject.room][user]) {
								clearTimeout(villo.chat.presence._timeouts[joinObject.room][user]);
							} else {
								villo.chat.presence.rooms[joinObject.room].users.push(user);
								//New User, so push event to the callback:
								if(joinObject.callback && typeof(joinObject.callback) === "function"){
									joinObject.callback({
										name: "new-user",
										data: villo.chat.presence.rooms[joinObject.room]
									});
								}
							}
							
							villo.chat.presence._timeouts[joinObject.room][user] = setTimeout(function(){
								villo.chat.presence.rooms[joinObject.room].users.splice([villo.chat.presence.rooms[joinObject.room].users.indexOf(user)], 1);
								delete villo.chat.presence._timeouts[joinObject.room][user];
								joinObject.callback({
									name: "exit-user",
									data: villo.chat.presence.rooms[joinObject.room]
								});
							}, 5000);
						} else {
							//Some other event. We just leave this here for potential future expansion.
						}
					}
				});
				
				/*
				 * Announce our first presence, then keep announcing it.
				 */
				
				PUBNUB.publish({
					channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + joinObject.room.toUpperCase(),
					message: {
						name: 'user-presence',
						data: {
							username: villo.user.username,
						}
					}
				});
				
				this._intervals[joinObject.room] = window.setInterval(function(){
					PUBNUB.publish({
						channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + joinObject.room.toUpperCase(),
						message: {
							name: 'user-presence',
							data: {
								username: villo.user.username,
							}
						}
					});
				}, 3000);
				
				return true;
			},
			//Also use get as a medium to access villo.chat.presence.get
			get: function(getObject){
				this._get[getObject.room] = {}
				
				PUBNUB.subscribe({
					channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + getObject.room.toUpperCase(),
					callback: function(evt){
						if (evt.name === "user-presence") {
							var user = evt.data.username;
							
							if (villo.chat.presence._get[getObject.room][user]) {
								
							} else {
								
							}
							
							villo.chat.presence._get[getObject.room][user] = {"username": user};
						} else {
							//Some other event. We just leave this here for potential future expansion.
						}
					}
				});
				
				window.setTimeout(function(){
					PUBNUB.unsubscribe({
						channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + getObject.room.toUpperCase(),
					});
					var returnObject = {
						room: getObject.room,
						users: []
					};
					for(x in villo.chat.presence._get[getObject.room]){
						returnObject.users.push(villo.chat.presence._get[getObject.room][x].username);
					}
					getObject.callback(returnObject);
				}, 4000);
			},
			
			leave: function(leaveObject){
				PUBNUB.unsubscribe({
					channel: "VILLO/PRESENCE/" + villo.app.id.toUpperCase() + "/" + leaveObject.room.toUpperCase(),
				});
				clearInterval(this._intervals[leaveObject.room]);
				delete this._intervals[leaveObject.room];
				delete this._timeouts[leaveObject.room];
				delete this.rooms[leaveObject.room];
				return true;
			},
			
			/*
			 * @private
			 * These are the private variables, they should only be referenced by the Villo framework itself.
			 */
			_timeouts: {},
			_intervals: {},
			_get: {},
		}
})();
/* Villo Clipboard */
(function(){
	villo.clipboard = {
/**
	villo.clipboard.copy
	====================
	
    Used to copy a string of text to the villo.app.clipboard object, for retrieval at some point.
    
	Calling
	-------

	`villo.clipboard.copy(string)`

	Returns
	-------
	
	Returns the index of the string within the villo.app.clipboard object.
	
	Use
	---
	
		villo.clipboard.copy("What's up, dawg!?");

*/

		copy: function(string){
			var newIndex = villo.app.clipboard.length;
			villo.app.clipboard[newIndex] = string;
			return newIndex;
		},         
/**
	villo.clipboard.paste
	=====================
	
    Retrieves a string of text that has previously been copied.
    
    Calling
	-------

	`villo.clipboard.paste(index)`
    
    - The "index" argument is optional. If it is not passed, the last text copied will be returned.

	Returns
	-------
	
	Returns the string of text that was previously copied. If no index is defined in the call, then the last string of text copied will be returned.
	
	Use
	---
	
		var oldInput = villo.clipboard.paste();

*/

		paste: function(index){
			if (index) {
				return villo.app.clipboard[index];
			} else {
				var lastIndex = villo.app.clipboard.length;
				return villo.app.clipboard[lastIndex - 1];
			}
		}
	}
})();

/* Villo Friends */
(function(){
	villo.friends = {
/**
	villo.friends.add
	=================
	
    Adds a friend to the current user's friend list.
    
	Calling
	-------

	`villo.friends.add({username: string, callback: function})`
	
	- The "username" parameter is the username of the user which you wish to add to the friends list.
	- The "callback" should be a function that is called when the function is completed.
	
	Callback
	--------
		
	If the username does not exist, 0 will be passed to the callback. If the user does exist, an object will be passed to the callback function which will contain an object with the current user's friends, formatted like this:
		
		{"friends": [
			"Kesne",
			"Admin",
			"someOtherUser"
		]}
		
	Use
	---
		
		villo.friends.add({
			username: "someThirdUser",
			callback: function(friends){
				//The friends variable has a list of the current user's friends.
			}
		});

*/
		add: function(addObject){
			villo.ajax("https://api.villo.me/friends.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: "add",
					username: villo.user.username,
					token: villo.user.token,
					addUsername: addObject.username
				},
				onSuccess: function(transport){
					//Return Vales
					//transport.friends - Success
					//0 - Bad Username
					//33 - Generic Error
					//66 - Unauthenticated User
					//99 - Unauthorized App
					
					villo.verbose && villo.log(transport);
					
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.friends) {
							addObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
								addObject.callback(transport);
							} else {
								addObject.callback(33);
							}
					} else {
						addObject.callback(33);
					}
				},
				onFailure: function(){
					addObject.callback(33);
				}
			});
		},
/**
	villo.friends.remove
	====================
	
    Remove a current friend from the user's friend list.
    
	Calling
	-------

	`villo.friends.remove({username: string, callback: function})`
	
	- The "username" parameter is the username of the user which you wish to remove from the friends list.
	- The "callback" is a function that is called when the friend has been removed.
	
	Callback
	--------
		
	If the function is completed, an object will be passed to the callback function which will contain an object with the current user's friends, formatted like this:
		
		{"friends": [
			"Kesne",
			"Admin"
		]}
		
	Use
	---
		
		villo.friends.remove({
			username: "someOtherUser",
			callback: function(friends){
				//The friends variable has a list of the current user's friends.
			}
		});

*/	
		remove: function(removeObject){
			villo.ajax("https://api.villo.me/friends.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: "remove",
					username: villo.user.username,
					token: villo.user.token,
					removeUsername: removeObject.username
				},
				onSuccess: function(transport){
					//Return Vales
					//transport.friends - Success
					//0 - Bad Username
					//33 - Generic Error
					//66 - Unauthenticated User
					//99 - Unauthorized App
					villo.verbose && villo.log(transport);
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.friends) {
							removeObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
								removeObject.callback(transport);
							} else {
								removeObject.callback(33);
							}
					} else {
						removeObject.callback(33);
					}
				},
				onFailure: function(){
					removeObject.callback(33);
				}
			});
		},
		/**
		 * Get the currently logged in user's friend list.
		 * @param {object} getObject Options for the function.
		 * @param {function} getObject.callback Funtion to call once the profile is retrieved.
		 * @since 0.8.0
		 */
/**
	villo.friends.get
	=================
	
    Get the friend list for the user currently logged in.
    
	Calling
	-------

	`villo.friends.get({callback: function})`
	
	- The "callback" is a function that is called when the friend has been removed.
	
	Callback
	--------
		
	The friends list will be passed to the callback and formatted like this:
		
		{"friends": [
			"Kesne",
			"Admin"
		]}
		
	Use
	---
		
		villo.friends.get({
			callback: function(friends){
				//The friends variable has a list of the current user's friends.
			}
		});

*/	
		get: function(getObject){
			villo.ajax("https://api.villo.me/friends.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: "get",
					username: villo.user.username,
					token: villo.user.token
				},
				onSuccess: function(transport){
				
					//Return Vales
					//JSON - Success
					//0 - Bad Username
					//33 - Generic Error
					//66 - Unauthenticated User
					//99 - Unauthorized App
					
					villo.verbose && villo.log(transport)
					
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.friends) {
							getObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
								getObject.callback(transport);
							} else {
								getObject.callback(33);
							}
					} else {
						getObject.callback(33);
					}
				},
				onFailure: function(){
					getObject.callback(33);
				}
			});
		}
	}
})();


/* Villo Gift */
(function(){

/**
	villo.gift
	==================
	
	As of Villo 1.0.0 Villo's Gift functionality is being rewritten from the ground up to make it easier for developers to use. 
	
	A public release for Villo's Gift functionality is planned for Villo version 1.2.0. 
*/
	
	//Sync them, web interface for adding gifts
	villo.gift = {
		retrieve: function(giftObject){
			villo.ajax("https://api.villo.me/gifts.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: 'specific',
					category: giftObject.categoryStack
				},
				onSuccess: function(transport){
					villo.log(transport);
					if (transport !== "") {
						var tmprsp = JSON.parse(transport)
						if (tmprsp.gifts) {
							giftObject.callback(tmprsp);
						} else {
							if (transport == 33 || transport == 66 || transport == 99) {
								giftObject.callback(transport);
							} else {
								giftObject.callback(33);
							}
						}
					} else {
						giftObject.callback(99);
					}
				},
				onFailure: function(failure){
					villo.log("failure!");
					giftObject.callback(33);
				}
			});
		},
		//The original shipping version of Villo had a typo. We fix it here.
		getCatagories: function(){
			villo.gift.getCategories(arguments);
		},
		
		getCategories: function(giftObject){
			//Get gifts under a specific category
			villo.ajax("https://api.villo.me/gifts.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: 'category'
				},
				onSuccess: function(transport){
					villo.log(transport);
					if (transport !== "") {
						var tmprsp = JSON.parse(transport)
						if (tmprsp.gifts) {
							giftObject.callback(tmprsp);
						} else {
							if (transport == 33 || transport == 66 || transport == 99) {
								giftObject.callback(transport);
							} else {
								giftObject.callback(33);
							}
						}
					} else {
						giftObject.callback(33);
					}
				},
				onFailure: function(failure){
					villo.log("failure!");
					giftObject.callback(33);
				}
			});
		},
		
		buy: function(giftObject){
			//Get gifts under a specific category
			villo.ajax("https://api.villo.me/gifts.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: 'buy',
					username: villo.user.username,
					token: villo.user.token,
					buyID: giftObject.giftID
				},
				onSuccess: function(transport){
					villo.log(transport);
					if (transport !== "") {
						var tmprsp = JSON.parse(transport)
						if (tmprsp.gifts) {
							giftObject.callback(tmprsp);
						}
						if (transport == 33 || transport == 66 || transport == 99) {
							giftObject.callback(transport);
						} else {
							giftObject.callback(33);
						}
					} else {
						giftObject.callback(33);
					}
				},
				onFailure: function(failure){
					villo.log("failure!");
					giftObject.callback(33);
				}
			});
		},
		
		credits: function(giftObject){
			villo.log(villo.user.token);
			villo.log("Gettin' it!!");
			//Get gifts under a specific category
			villo.ajax("https://api.villo.me/gifts.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: 'checkCredit',
					username: villo.user.username,
					token: villo.user.token
				},
				onSuccess: function(transport){
					villo.log(transport);
					if (transport !== "") {
						var tmprsp = JSON.parse(transport)
						if (tmprsp.gifts) {
							villo.credits = tmprsp.gifts.data;
							giftObject.callback(tmprsp);
						}
						if (transport == 33 || transport == 66 || transport == 99) {
							giftObject.callback(transport);
						} else {
							giftObject.callback(33);
						}
					} else {
						giftObject.callback(33);
					}
				},
				onFailure: function(failure){
					villo.log("failure!");
					giftObject.callback(33);
				}
			});
		},
		
		purchases: function(giftObject){
			//Get gifts under a specific category
			villo.ajax("https://api.villo.me/gifts.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: 'purchases',
					username: villo.user.username,
					token: villo.user.token
				},
				onSuccess: function(transport){
					villo.log(transport);
					if (transport !== "") {
						var tmprsp = JSON.parse(transport)
						if (tmprsp.gifts) {
							villo.credits = tmprsp.gifts.data;
							giftObject.callback(tmprsp);
						}
						if (transport == 33 || transport == 66 || transport == 99) {
							giftObject.callback(transport);
						} else {
							giftObject.callback(33);
						}
					} else {
						giftObject.callback(33);
					}
				},
				onFailure: function(failure){
					giftObject.callback(33);
				}
			});
		}
	}
})();

/* Villo Init/Load */


//TODO:
//We should also encourage usage of this for things like extensions, where they can have an info.js file that loads up the extension.
//Change what villo.load does based on if it was already called. If it was, use it for excess file loading.


(function(){
	//We aren't loaded yet
	villo.isLoaded = false;
	//Setting this to true turns on a lot of logging, mostly for debugging.
	villo.verbose = false;
/**
	villo.load
	==================
	
    The load function can be called for two things. It is used to initialize the Villo library. 
    
    Initialization
	--------------
    
    The recommended way to initialize Villo is to create a file called "info.villo.js". This file should be called after villo.js.
    	
    	<script type="text/javascript" src="villo.js"></script>
    	<script type="text/javascript" src="info.villo.js"></script>
    	
    This file should contain the call to villo.load, which will allow you to call Villo's APIs.
    
	Calling
	-------

	`villo.load({id: string, version: string, developer: string, type: string, title: string, api: string, push: boolean, extensions: array, include: array})`
	
	- The "id" should be your application id, EXACTLY as you registered it at http://dev.villo.me.
	- The "version" is a string containing your application version. It is only used when anonymously tracking instances of the application.
	- "Developer" is the name of your development company. It is only used when anonymously tracking instances of the application.
	- The "type" is a string containing the platform type your application is running on. Supported types are "desktop" and "mobile". Currently, this is not used, but still needs to be specified.
	- "Title" is the title of your application. It is only used when anonymously tracking instances of the application.
	- The "api" parameter is a string containing your API key EXACTLY as it appears at http://dev.villo.me. 
	- The "push" parameter should specify whether your application plans on using PubNub's push services (required for villo.chat, villo.presence, villo.feeds, and others). As of Villo 1.0.0, this parameter is not required because PubNub is included by default.
	- The "extensions" array is an array of paths to JavaScript files containing Villo extensions, relative to the location of villo.js. This parameter is optional.
	- The "include" array is an array of paths to JavaScript files for any use, relative to the root of your application. This parameter is optional.

		
	Use
	---
		
	An example of villo.load used in an info.villo.js file:
		
		villo.load({
			"id": "your.app.id",
			"version": "1.0.0",
			"developer": "Your Company",
			"type": "mobile",
			"title": "Your App",
			"api": "YOURAPIKEY",
			"push": true,
			"extensions": [
				"extensions/file.js"
			],
			"include": [
				"source/app.js",
				"source/other.js"
			],
		});

*/
	villo.load = function(options){
		if (villo.isLoaded === true) {
			
			return true;
			
			//Extensions
			
			/*
			if(options && typeof(options) === "object" && options.resources){
				for(x in options){
					//if(js){
					//	$script(js);
					//}else if(css){
					//	doCss(css);
					//}
				}
			}
			*/
			
		}else{
			
			/*
			 * Initialization
			 */
			
			if (options.api) {
				villo.apiKey = options.api;
			}
			
			if (options.useCookies && options.useCookies == true) {
				villo.overrideStorage(true);
			}
			
			
			
			//Load up the settings (includes sync).
			if (store.get("VilloSettingsProp")) {
				villo.settings.load({
					callback: villo.doNothing()
				});
			}
			
			//Passed App Information
			villo.app.platform = options.platform;
			villo.app.title = options.title;
			villo.app.id = options.id;
			villo.app.version = options.version;
			villo.app.developer = options.developer;
			
			//How verbose do we want Villo to be?
			if(options.verbose){
				villo.verbose = options.verbose;
			}
			
			//Check login status.
			if (store.get("token.user") && store.get("token.token")) {
				villo.user.username = store.get("token.user");
				villo.user.token = store.get("token.token");
				//User Logged In
				villo.sync();
			} else {
			//User not Logged In
			}
			
			//Load pre-defined extensions. This makes adding them a breeze.
			if (options.extensions && (typeof(options.extensions == "object")) && options.extensions.length > 0) {
				var extensions = [];
				for (x in options.extensions) {
					if (options.extensions.hasOwnProperty(x)) {
						extensions.push(villo.script.get() + options.extensions[x]);
					}
				}
				$script(extensions, "extensions");
			}else if (options.include && (typeof(options.include == "object")) && options.include.length > 0) {
				var include = [];
				for (x in options.include) {
					if (options.include.hasOwnProperty(x)) {
						include.push(options.include[x]);
					}
				}
				$script(include, "include");
			} else {
				villo.doPushLoad(options);
			}
			
			$script.ready("extensions", function(){
				//Load up the include files
				if (options.include && (typeof(options.include == "object") && options.include.length > 0)) {
					var include = [];
					for (x in options.include) {
						if (options.include.hasOwnProperty(x)) {
							include.push(options.include[x]);
						}
					}
					$script(include, "include");
				} else {
					//No include, so just call the onload
					villo.doPushLoad(options);
				}
			});
			
			$script.ready("include", function(){
				villo.doPushLoad(options);
			});
		}
	};
	villo.doPushLoad = function(options){
		//Villo now loads the PubNub in it's dependencies file, and as such doesn't need to pull it in here, so we just call the onload function.
		if ("VILLO_SETTINGS" in window && typeof(VILLO_SETTINGS.ONLOAD == "function")) {
			VILLO_SETTINGS.ONLOAD(true);
		}
		villo.isLoaded = true;
	};
	//Override default storage options with a cookie option.
	//* @protected
	villo.overrideStorage = function(doIt){
		if(doIt == true){
			store = {
				set: function(name, value, days){
					if (days) {
						var date = new Date();
						date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
						var expires = "; expires=" + date.toGMTString();
					} else {
						var expires = "";
					}
					document.cookie = name+"="+value+expires+"; path=/";
				},
				get: function(name){
					var nameEQ = name + "=";
					var ca = document.cookie.split(';');
					for(var i=0;i < ca.length;i++) {
						var c = ca[i];
						while (c.charAt(0) == ' ') {
							c = c.substring(1, c.length);
						}
						if (c.indexOf(nameEQ) == 0) {
							return c.substring(nameEQ.length, c.length);
						}
					}
					return null;
				},
				remove: function(name) {
					store.set(name,"",-1);
				}
			}
		}
	}
	
	/*
	 * Old Villo Init.
	 */
	villo.init = function(options){
		return false;
	}
})();
/* Villo Leaders */
(function(){
	villo.leaders = {		
/**
	villo.leaders.get
	=================
	
    Get the top scores in your app, based on durations. As of 0.8.5, you can use multiple leader boards per app. You can also specify how many records you want to retrieve, to increase performance.
    
    Calling
	-------

	`villo.leaders.get({duration: string, board: string, callback: function, limit: number})`
    
    - "Duration" is the time frame you want to load the scores from. Possible durations include "all", "year", "month", "day", and "latest".
    - "Board"  is an optional parameter that lets you specify what leaderboard you wish to grab scores from in your application.
    - "Callback" is a function that is called when the retrieval of scores from the server is completed. The scores object is passed to the callback.
    - "Limit" is an optional parameter that lets you limit the number of scores retrieved from the database, for perfomance reasons. If the parameter is not passed, a value of 30 will be used by default.

	Callback
	--------
	
	An object will be passed to the callback. The object will be formatted like this, where data is the score submitted:
	
		{"leaders":[
			{"username":"kesne","data":"203","date":"2011-06-24"},
			{"username":"kesne","data":"193","date":"2011-06-13"},
			{"username":"admin","data":"110","date":"2011-06-13"},
		]}
	
	Use
	---
	
		villo.leaders.get({
			duration: "all",
			callback: function(leaderboard){
				//Check for errors.
				if(leaderboard && leaderboard.leaders){
					var leaders = leaderboard.leaders;
					//Now you can do something with the leaderboard array, stored in the leaders array.
				}else{
					//Some error occured.
					alert("Error getting leaderboards.")
				}
			},
			limit: 50
		});

*/
		get: function(getObject){
			if (getObject.board && getObject.board !== "") {
				var leaderBoardName = getObject.board;
			} else {
				var leaderBoardName = villo.app.title;
			}
			
			if(getObject.limit && getObject.limit !== "" && typeof(getObject.limit) == "number"){
				var leaderLimiter = getObject.limit;
			}else{
				var leaderLimiter = 30;
			}
			
			villo.ajax("https://api.villo.me/leaders.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					type: getObject.duration,
					username: villo.user.username,
					appName: leaderBoardName,
					appid: villo.app.id,
					limit: leaderLimiter
				},
				onSuccess: function(transport){
					villo.verbose && villo.log("Success!");
					villo.verbose && villo.log(transport);
					if (transport !== "") {
						var tmprsp = JSON.parse(transport)
						if (tmprsp.leaders) {
							getObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
								getObject.callback(transport);
							} else {
								getObject.callback(33);
							}
					} else {
						getObject.callback(33);
					}
				},
				onFailure: function(failure){
					villo.verbose && villo.log("failure!");
					getObject.callback(33);
				}
			});
		},
/**
	villo.leaders.search
	====================
	
    Search the leaderboard records for a user's scores. The username can be partial, or complete. All username matches will be retrieved. You can also specify how many records you want to retrieve, to increase performance.
    
    Calling
	-------

	`villo.leaders.search({username: string, board: string, callback: function, limit: number})`
    
    - "Username" is the full or partial username you want to get the scores for.
    - "Board"  is an optional parameter that lets you specify what leaderboard you wish to grab scores from in your application.
    - "Callback" is a function that is called when the retrieval of the user's scores from the server is completed. The scores object is passed to the callback.
    - "Limit" is an optional parameter that lets you limit the number of scores retrieved from the database, for perfomance reasons. If the parameter is not passed, a value of 30 will be used by default.

	Callback
	--------
	
	An object will be passed to the callback. The object will be formatted like this, where data is the score submitted:
	
		{"leaders":[
			{"username":"noah","data":"243","date":"2011-06-24"},
			{"username":"noah","data":"200","date":"2011-06-24"},
			{"username":"noahtest","data":"178","date":"2011-06-13"},
			{"username":"noahtest2","data":"93","date":"2011-06-13"},
		]}
	
	Use
	---
	
		villo.leaders.search({
			username: this.$.scoreSearch.getValue(),
			callback: function(leaderboard){
				//Check for errors.
				if(leaderboard && leaderboard.leaders){
					var leaders = leaderboard.leaders;
					//Now you can do something with the leaderboard array, stored in the leaders array.
				}else{
					//Some error occured.
					alert("Error getting leaderboards.")
				}
			},
			limit: 50
		});

*/
		search: function(getObject){
			if (getObject.board && getObject.board !== "") {
				var leaderBoardName = getObject.board;
			} else {
				var leaderBoardName = villo.app.title;
			}
			
			if(getObject.limit && getObject.limit !== "" && typeof(getObject.limit) == "number"){
				var leaderLimiter = getObject.limit;
			}else{
				var leaderLimiter = 30;
			}
			
			villo.ajax("https://api.villo.me/leaders.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					type: "search",
					username: villo.user.username,
					appName: leaderBoardName,
					appid: villo.app.id,
					usersearch: getObject.username,
					limit: leaderLimiter
				},
				onSuccess: function(transport){
					villo.verbose && villo.log("Success!");
					villo.verbose && villo.log(transport);
					if (transport !== "") {
						var tmprsp = JSON.parse(transport)
						if (tmprsp.leaders) {
							getObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
								getObject.callback(transport);
							} else {
								getObject.callback(33);
							}
					} else {
						getObject.callback(33);
					}
				},
				onFailure: function(failure){
					villo.verbose && villo.log("failure!");
					getObject.callback(33);
				}
			});
		},
		
		/**
		 * Submit a score to the app's leaderboard. As of 0.8.5, multiple leaderboards are supported, as well as anonymous postings for users not logged in.
		 * @param {object} scoreObject Options for the leaderboard, and the callback.
		 * @param {string} scoreObject.score The score you wish to submit to the leaderboard.
		 * @param {string} scoreObject.board Optional parameter. This is the name of the board that you want to submit to. If none is selected, the applications name will be used.
		 * @param {function} scoreObject.callback Funtion to call once the score is submitted.
		 * @since 0.8.0
		 */
/**
	villo.leaders.submit
	====================
	
    Submit a given (numerical) score to a leaderboard.
    
    Calling
	-------

	`villo.leaders.get({duration: string, board: string, callback: function, limit: number})`
    
    - "Duration" is the time frame you want to load the scores from. Possible durations include "all", "year", "month", "day", and "latest".
    - "Board"  is an optional parameter that lets you specify what leaderboard you wish to grab scores from in your application.
    - "Callback" is a function that is called when the retrieval of scores from the server is completed. The scores object is passed to the callback.
    - "Limit" is an optional parameter that lets you limit the number of scores retrieved from the database, for perfomance reasons. If the parameter is not passed, a value of 30 will be used by default.

	Callback
	--------
	
	An object will be passed to the callback. The object will be formatted like this, where data is the score submitted:
	
		{"leaders":[
			{"username":"kesne","data":"203","date":"2011-06-24"},
			{"username":"kesne","data":"193","date":"2011-06-13"},
			{"username":"admin","data":"110","date":"2011-06-13"},
		]}
	
	Use
	---
	
		villo.leaders.get({
			duration: "all",
			callback: function(leaderboard){
				//Check for errors.
				if(leaderboard && leaderboard.leaders){
					var leaders = leaderboard.leaders;
					//Now you can do something with the leaderboard array, stored in the leaders array.
				}else{
					//Some error occured.
					alert("Error getting leaderboards.")
				}
			},
			limit: 50
		});

*/
		submit: function(scoreObject){
		
			if (scoreObject.board && scoreObject.board !== "") {
				var leaderBoardName = scoreObject.board;
			} else {
				var leaderBoardName = villo.app.title;
			}
			if (villo.user.username == "" || !villo.user.username || (scoreObject.anon && scoreObject.anon == true)) {
				var leaderBoardUsername = "Guest"
			} else {
				var leaderBoardUsername = villo.user.username;
			}
			
			villo.ajax("https://api.villo.me/leaders.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					type: "submit",
					username: leaderBoardUsername,
					token: villo.user.token,
					appName: leaderBoardName,
					appid: villo.app.id,
					score: scoreObject.score
				},
				onSuccess: function(transport){
					villo.verbose && villo.log(transport);
					if (transport !== "") {
						var tmprsp = JSON.parse(transport)
						if (tmprsp.leaders) {
							scoreObject.callback(tmprsp);
						} else if (transport == 33 || transport == 66 || transport == 99) {
							scoreObject.callback(transport);
						} else {
							scoreObject.callback(33);
						}
					} else {
						scoreObject.callback(33);
					}
				},
				onFailure: function(failure){
					villo.verbose && villo.log("failure!");
					scoreObject.callback(33);
				}
			});
		}
	}
})();
/* Villo Messages */
(function(){
	//TODO
	villo.messages = {}
})();

/* Villo Profile */
(function(){
	villo.profile = {
		//TODO: Figure out the callback for non-existing users.
/**
	villo.profile.get
	=================
	
    Gets the user profile for a specific user (found by their username).
    
	Calling
	-------

	`villo.profile.get({username: string, callback: function})`
	
	- The "username" parameter is the username of the user profile to get. If this parameter is not passed, then the profile for the user currently logged in will be used.
	- The "callback" should be a function that is called when the function is completed.
	
	Callback
	--------
		
	If the username does not exist, FIGURE OUT WHAT HAPPENS! If the user does exist, an object will be passed to the callback function which will contains the user's profile, formatted like this:
		
		{"profile": [{
			"username": "",
			"other things": ""
		}]}
		
	Use
	---
		
		villo.profile.get({
			username: "kesne",
			callback: function(profile){
				//Do something wid it.
			}
		});

*/
		get: function(getObject){
			if (!getObject.username) {
				getObject.username = villo.user.username;
			}
			villo.ajax("https://api.villo.me/profile.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: "get",
					username: getObject.username
				},
				onSuccess: function(transport){
					villo.verbose && villo.log(transport);
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.profile) {
							getObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
								getObject.callback(transport);
							} else {
								getObject.callback(33);
							}
					} else {
						getObject.callback(33);
					}
				},
				onFailure: function(){
					getObject.callback(33);
				}
			});
		},
/**
	villo.profile.set
	=================
	
    Sets a specific field in the user's profile (the user currently logged in) to a new value.
    
	Calling
	-------

	`villo.profile.get({username: string, callback: function})`
	
	- The "username" parameter is the username of the user profile to get. If this parameter is not passed, then the profile for the user currently logged in will be used.
	- The "callback" should be a function that is called when the function is completed.
	
	Callback
	--------
		
	If the username does not exist, FIGURE OUT WHAT HAPPENS! If the user does exist, an object will be passed to the callback function which will contains the user's profile, formatted like this:
		
		{"profile": [{
			"username": "",
			"other things": ""
		}]}
		
	Use
	---
		
		villo.profile.get({
			username: "kesne",
			callback: function(profile){
				//Do something wid it.
			}
		});

*/	
		set: function(updateObject){
			villo.ajax("https://api.villo.me/profile.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					username: villo.user.username,
					token: villo.user.token,
					type: "specific",
					field: updateObject.field,
					data: updateObject.data
				},
				onSuccess: function(transport){
					villo.verbose && villo.log(transport);
					//Stop at logging:
					//return;
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.profile) {
							updateObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
								updateObject.callback(transport);
							} else {
								updateObject.callback(33);
							}
					} else {
						updateObject.callback(33);
					}
				},
				onFailure: function(){
					updateObject.callback(33);
				}
			});
		},
/**
	villo.profile.friends
	=====================
	
    Gets the profiles for all of the users on your friend list. This feature can be used as a replacement for villo.friends.get when you need the detailed profiles for all of your friends.
    
	Calling
	-------

	`villo.profile.friends({callback: function})`
	
	- The "callback" should be a function that is called when the profiles for the user's friends have been retrieved.
	
	Callback
	--------
		
	An object will be passed to the callback function which will contains the profiles of the user's friends, formatted like this:
		
		{"profile": [
		{
			"username": "",
			"other things": ""
		},
		{
			"username": "",
			"other things": ""
		},
		]}
		
	Use
	---
		
		villo.profile.friends({
			callback: function(profile){
				//Do something wid it.
			}
		});

*/
		friends: function(updateObject){
			villo.verbose && villo.log("called");
			villo.ajax("https://api.villo.me/profile.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					username: villo.user.username,
					token: villo.user.token,
					type: "friends",
				},
				onSuccess: function(transport){
					////Stop at logging:
					if (!transport == "") {
						var tmprsp = JSON.parse(transport);
						if (tmprsp.friends) {
							updateObject.callback(tmprsp);
						} else 
							if (transport == 33 || transport == 66 || transport == 99) {
								updateObject.callback(transport);
							} else {
								updateObject.callback(33);
							}
					} else {
						updateObject.callback(33);
					}
				},
				onFailure: function(){
					villo.verbose && villo.log("fail");
					updateObject.callback(33);
				}
			});
		}
	}
})();
/* 
 * Villo Settings
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.settings = {
		//We strap the settings on to villo.app.settings.
		load: function(loadObject){
			if (loadObject.instant && loadObject.instant == true) {
				villo.app.settings = store.get("VilloSettingsProp").settings;
				return villo.app.settings;
			} else {
				var theTimestamp = store.get("VilloSettingsProp").timestamp;
				villo.storage.get({
					privacy: true,
					title: "VilloSettingsProp",
					callback: function(transit){
						transit = JSON.parse(JSON.parse(transit));
						if (!transit.storage) {
							villo.app.settings = store.get("VilloSettingsProp").settings
							loadObject.callback(store.get("VilloSettingsProp").settings);
						} else {
							if (transit.storage.timestamp > timestamp) {
								store.set("VilloSettingsProp", transit.storage);
								villo.app.settings = transit.storage.settings
								loadObject.callback(transit.storage.settings);
							} else {
								villo.app.settings = store.get("VilloSettingsProp").settings
								loadObject.callback(store.get("VilloSettingsProp").settings);
							}
						}
					}
				});
			}
		},
		save: function(saveObject){
			var settingsObject = {};
			var d = new Date();
			//Universal Timestamp Win
			var timestamp = d.getTime();
			settingsObject.timestamp = timestamp;
			settingsObject.settings = saveObject.settings;
			store.set("VilloSettingsProp", settingsObject);
			villo.app.settings = settingsObject.settings;
			villo.storage.set({
				privacy: true,
				title: "VilloSettingsProp",
				data: settingsObject
			});
		},
		destroy: function(){
			store.remove("VilloSettingsProp");
		}
	}
})();
/* 
 * Villo App States
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.states = {
		set: function(setObject, callbackFunc){
			store.set("VAppState", setObject);
			villo.storage.set({
				privacy: true,
				title: "VAppState",
				data: setObject,
				callback: function(transit){
					//callbackFunc(transit);
				}
			});
		},
		get: function(getObject){
			if (getObject.instant && getObject.instant == true) {
				//Don't force return, allow callback:
				if(getObject.callback){
					getObject.callback(store.get("VAppState"));
				}
				return store.get("VAppState");
			} else {
				villo.storage.get({
					privacy: true,
					title: "VAppState",
					callback: function(transit){
						var transit = JSON.parse(transit);
						transit.storage = JSON.parse(villo.stripslashes(transit.storage));
						
						villo.log(transit);
						if (!transit.storage) {
							getObject.callback(store.get("VAppState"));
						} else {
							getObject.callback(transit.storage);
						}
					}
				});
			}
		},
	}
})();/* 
 * Villo Cloud Storage
 * ==========
 * Copyright 2011 Jordan Gensler. All rights reserved.
 */
(function(){
	villo.storage = {
		/**
		 * Store a piece of data on the cloud.
		 * @param {object} addObject Object containing the options.
		 * @param {boolean} addObject.privacy Can either be set to true or false. If you set it to true, the data will only be able to be accessed in the app that you set it in, and will be encrypted on the database using AES-256 encryption.
		 * @param {string} addObject.title The title of the data that you want to store.
		 * @param {string} addObject.data The data that you want to store on the database. You can also pass an object and we will stringify it for you.
		 * @param {string} addObject.callback Function to be called when the data is set on the server.
		 * @since 0.8.5
		 */
		set: function(addObject){
			//The managing of update vs new content is handled on the server
			if (!addObject.privacy) {
				addObject.privacy = false;
			}
			if (typeof(addObject.data) == "object") {
				//We'll be nice and stringify the data for them.
				addObject.data = JSON.stringify(addObject.data);
			}
			villo.ajax("https://api.villo.me/storage.php", {
				method: 'post',
				parameters: {
					//This is one hell of a beefy server call.
					api: villo.apiKey,
					appid: villo.app.id,
					app: villo.app.title,
					type: "store",
					username: villo.user.username,
					token: villo.user.token,
					privacy: addObject.privacy,
					title: addObject.title,
					data: addObject.data
				},
				onSuccess: function(transport){
					if (!transport == "") {
						addObject.callback(transport);
					} else {
						addObject.callback(33);
					}
				},
				onFailure: function(){
					addObject.callback(33);
				}
			});
		},
		/**
		 * Get a piece of data that is stored on the cloud.
		 * @param {object} getObject Object containing the options.
		 * @param {boolean} getObject.privacy If the data on the server is set to "private" you need to set this to true in order to access and decrypt it.
		 * @param {string} getObject.title The title of the data that you want to store.
		 * @param {string} getObject.data The data that you want to store on the database. You can also pass an object and we will stringify it for you.
		 * @param {string} getObject.callback Function to be called when the data is set on the server.
		 * @param {object} getObject.external If you are accessing an external app's public data, include this object..
		 * @param {string} getObject.external.appTitle The title of the external app you are recieving data from.
		 * @param {string} getObject.external.appID The appID of the external app you are recieving data from.
		 * @since 0.8.5
		 */
		get: function(getObject){
			//TODO: Finish this.
			if (!getObject.privacy) {
				getObject.privacy = false;
			}
			if (getObject.external) {
				var storeGetTitle = getObject.external.appTitle;
				var storeGetAppID = getObject.external.appID;
			} else {
				var storeGetTitle = villo.app.title;
				var storeGetAppID = villo.app.id;
			}
			villo.ajax("https://api.villo.me/storage.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: storeGetAppID,
					app: storeGetTitle,
					type: "retrieve",
					username: villo.user.username,
					token: villo.user.token,
					title: getObject.title,
					privacy: getObject.privacy
				},
				onSuccess: function(transport){
					if (!transport == "") {
						getObject.callback(transport);
					} else {
						getObject.callback(33);
					}
				},
				onFailure: function(){
					getObject.callback(33);
				}
			});
		}
	}
})();
/* Villo User */
(function(){
	villo.user = {
/**
	villo.user.login
	================
	
	Login a user to Villo using a username and password. 
    
	Calling
	-------

	`villo.user.login({username: string, password: string, callback: function})`
	
	- The "username" string should be the Villo username, as provided by the user.
	- The "password" string should be the Villo password, as provided by the user.
	- The "callback" funtion is called when the function is completed, letting you know if the user was logged in or not.

	Callback
	--------
		
	If the user was successfully logged in, then the callback value will be true. If the user's username was incorrect, the value will be "1". If the user's password was incorrect, the value will be "2".
		
	Use
	---
		
		villo.user.login({
			username: "SomeVilloUser",
			password: "somePassword1234",
			callback: function(success){
				//Check to see if we were logged in.
				if(success === true){
					alert("The user has been logged in");
				}else{
					alert("Could not log you in. Please check your username and password.");
				}
			}
		});
		
	Notes
	-----
	
	Once a user is logged into Villo, you do not need to store the username or password. Villo will automatically save the username, along with a unique authentication token, and will load both of them every time Villo is initialized.
	
	The username of the user currently logged in to Villo is stored as a string in villo.user.username, which you can view by calling villo.user.getUsername.

*/
		login: function(userObject, callback){
			villo.ajax("https://api.villo.me/user/login.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					username: userObject.username,
					password: userObject.password
				},
				onSuccess: function(transport){
					var token = transport;
					if (token == 1 || token == 2 || token == 33 || token == 99) {
						//Error, call back with our error codes.
						//We also are using the newer callback syntax here.
						if (callback) {
							callback(token);
						} else {
							userObject.callback(token);
						}
					} else 
						if (token.length == 33) {
							store.set("token.user", userObject.username);
							//returned token has a space at the beginning. No Bueno. Let's fix that. Probably should fix this server-side at some point
							token = token.substring(1);
							store.set("token.token", token);
							villo.user.username = userObject.username;
							villo.user.token = token;
							
							if (callback) {
								callback(true);
							} else {
								userObject.callback(true);
							}
							
							villo.sync();
						} else {
							callback(33);
							villo.verbose && villo.log(33);
							villo.verbose && villo.log("Error Logging In - Undefined: " + token);
						}
					//callback(transport);
				},
				onFailure: function(failure){
					callback(33);
				}
			});
		},
/**
	villo.user.logout
	=================
	
	Removes the current user session, and logs the user out.
    
	Calling
	-------

	`villo.user.logout()`

	Returns
	-------
		
	The function will return true if the user was logged out.
		
	Use
	---
		
		if(villo.user.logout() === true){
			//User is now logged out.
		}
		
	Notes
	-----
	
	Villo removes the username and unique app token used to authenticate API requests once a user is logged out, so the user will need to login again if they logout.   

*/
		logout: function(){
			//destroy user tokens and logout.
			store.remove("token.token");
			store.remove("token.user");
			//Remove the variables we're working with locally.
			villo.user.username = null;
			villo.user.token = null;
			//We did it!
			return true;
		},
/**
	villo.user.isLoggedIn
	=====================
	
	Checks to see if a user is currently logged into Villo.
    
	Calling
	-------

	`villo.user.isLoggedIn()`
	
	This function takes no arguments.

	Returns
	-------
		
	The function will return true if the user is logged in, and false if the user is not.
		
	Use
	---
		
		if(villo.user.isLoggedIn() === true){
			//User is logged in.
		}else{
			//User is not logged in.
		}

*/
		isLoggedIn: function(){
			if (villo.user.username && villo.user.username !== "" && villo.user.token && villo.user.token !== "") {
				return true;
			} else {
				return false;
			}
		},
		//TODO: Finish FourValue
/**
	villo.user.register
	===================
	
	Create a new Villo account with a specified username, password, and email address.
    
	Calling
	-------

	`villo.user.register({username: string, password: string, password_confirm: string, email: string, fourvalue: boolean, callback: function})`
	
	- The "username" string should be the desired Villo username which the user wishes to register.
	- The "password" string should be the desired Villo password, as provided by the user.
	- The "password_confirm" string is used to confirm two entered passwords, to ensure the user entered it correctly. As of Villo 1.0.0, the parameter isn't required, but can still be passed.
	- The "email" string is the email address of the user that is currently registering an account.
	- The "fourvalue" is a boolean, which you can set to true if you wish to get field-specific data returned to the callback when a registration fails. The value defaults to false, so it is not required that you pass the parameter.
	- The "callback" funtion is called when the function is completed, letting you know if the user was registered or not.

	Callback
	--------
		
	If the user account was created successfully, then the callback value will be true. If there was an error, it will return an error code. If you set "fourvalue" to true when calling the function, then the error codes will be different.
	
	FourValue
	---------
	
	FourValue was introduced to villo.user.register in 1.0.0, and it allows developers to provide more feedback to users creating accounts in Villo. FourValue replaces the basic error codes provided when creating a new account with an object containing what fields were incorrect when registering. The object will only be passed if the registration fails, and will be formatted like this:
	
		{"user":{
			"username": boolean,
			"password": boolean,
			"password_confirm": boolean,
			"email": boolean
		}}
		
	For any given field, if there was an error, it was return false for that field. If there was not an error, it will return true for that field.
		
	Use
	---
		
		villo.user.register({
			username: "SomeNewUser",
			password: "someNewPassword123",
			password_confirm: "someNewPassword123",
			email: "jordan@villo.me",
			fourvalue: true,
			callback: function(success){
				//Check to see if the account was registered.
				if(success === true){
					alert("Your account has been created, and you are now logged in!");
				}else{
					//Check to see if we were returned a fourvalue.
					if(success && success.user){
						//Store the fourvalues.
						var fourvalue = success.user;
						//We'll append the errors to this string.
						var errors = "";
						//Check the different values, and if there was an error, append it to the errors string.
						if(fourvalue.username === false){
							errors += "username ";
						}if(fourvalue.password === false){
							errors += "password ";
						}if(fourvalue.password_confirm === false){
							errors += "confirmation ";
						}if(fourvalue.email === false){
							errors += "email ";
						}
						//Let the users know what they did wrong.
						alert("Could not create the account. The following fields had errors: " + errors);
					}else{
						//Some generic error occured, which either has to do with the application, or Villo.
						alert("Some error occured :(")
					}
				}
			}
		});
		
	Notes
	-----
	
	Once a user is registered using villo.user.register, it will automatically log them in. You do not need to store the username or password. Villo will automatically save the username, along with a unique authentication token, and will load both of them every time Villo is initialized.

*/
		register: function(userObject, callback){
				villo.ajax("https://api.villo.me/user/register.php", {
					method: 'post',
					parameters: {
						api: villo.apiKey,
						appid: villo.app.id,
						username: userObject.username,
						password: userObject.password,
						password_confirm: (userObject.password_confirm || userObject.password),
						fourvalue: (userObject.fourvalue || false),
						email: userObject.email
					},
					onSuccess: function(transport){
						//Return 0 = Successfully registered
						//Return 1 = Error in the form
						//Return 99 = Unauthorized Application
						var token = transport;
						if (token == 1 || token == 2 || token == 33 || token == 99) {
							//Error, call back with our error codes.
							if (callback) {
								callback(token);
							} else {
								userObject.callback(token);
							}
						} else 
							if (token.length == 33) {
								store.set("token.user", userObject.username);
								//returned token has a space at the beginning. No Bueno. Let's fix that. Probably should fix this server-side at some point
								token = token.substring(1);
								store.set("token.token", token);
								villo.user.username = userObject.username;
								villo.user.token = token;
								if (callback) {
									callback(true);
								} else {
									userObject.callback(true);
								}
								villo.sync();
							//villo.log(0)
							} else {
								callback(33);
								villo.verbose && villo.log(33);
								villo.verbose && villo.log("Error Logging In - Undefined: " + token);
							}
					},
					onFailure: function(failure){
						callback(33);
					}
				});
		},
		strapLogin: function(strapObject){
			store.set("token.user", strapObject.username);
			store.set("token.token", strapObject.token);
			villo.user.username = strapObject.username;
			villo.user.token = strapObject.token;
			villo.sync();
		},
		
		username: null,
		
/**
	villo.user.getUsername
	==================
	
	This function returns the username of the user who is currently logged in. This function acts as a safe medium for villo.user.username, where the string is stored.
	
	Calling
	-------
	
	`villo.user.getUsername()`
	
	This function takes no arguments.
	
	Returns
	-------
	
	Will return the username of the currently logged in user. If no user is logged in, it will return false.
	
	Use
	---
	
		var username = villo.user.getUsername();
	
*/
		getUsername: function(){
			return villo.user.username || false;
		},
		
		token: ''
	}
})();

/* Villo Ajax */
(function(){
/**
	villo.ajax
	=================
	
    Cross-platform, cross-browser Ajax function. This is used by Villo to connect to the Villo APIs.
    
	Calling
	-------

	`villo.ajax(url, {method: string, parameters: object, onSuccess: function, onFailure: function})`
	
	- The "url" should be a string, which contains the URL (in full) of the file you wish to get through Ajax.
	- The "method" is a string which sets which method ("GET" or "POST") you wish to use when using the Ajax function.
	- The "parameters" objects sets the parameters to sent to the web service. These will be sent using the method you set in the method argument.
	- "onSuccess" is called after the Ajax request is completed. A string containing the response to the server will be passed to this function.
	- The "onFailure" function will be called if there was a problem with the Ajax request.
		
	Use
	---
	
		villo.ajax("http://mysite", {
			method: 'post', //You can also set this to "get".
			parameters: {
				"hello": "world"
			},
			onSuccess: function(transport){
				//The string of the response is held in the "transport" variable!
			},
			onFailure: function(err){
				//Something went wrong! Error code is held in the "err" variable.
			}
		});
	
	Notes
	-----
	
	On most modern browsers, cross-domain Ajax requests are allowed. However, there may still be issues with the server rejecting requests from different origins.
	
	Most of the Villo APIs require that your web browser supports cross-domain Ajax requests. If your browser does not support them, then you will likely not be able to use a majorty of Villo features.

*/

//TODO: JSONP fallback w/ YQL?

	villo.ajax = function(url, modifiers){
		//Set up the request.
		var sendingVars = "";
		for (x in modifiers.parameters) {
			sendingVars +=  escape(x) + "=" + escape(modifiers.parameters[x]) + "&";
		}
		
		//Differentiate between POST and GET, and send the request.
		if (modifiers.method.toLowerCase() === "post") {
			var method = "POST";
		} else {
			var method = "GET"
		}
		villo.verbose && console.log("Running Ajax Request...");
		//Send to the actual ajax function.
		villo._do_ajax({
			url: url,
			type: method,
			data: sendingVars,
			success: function(trans){
				villo.verbose && console.log(trans);
				modifiers.onSuccess(trans);
			},
			error: function(error){
				villo.verbose && console.log(error);
				modifiers.onFailure(error);
			}
		});	
	}
	//This function does the actual Ajax request.
	villo._do_ajax = function(options){
		//Internet Explorer checker:
		var is_iexplorer = function() {
	        return navigator.userAgent.indexOf('MSIE') != -1
	    }
	    
        var url = options['url'];
        var type = options['type'] || 'GET';
        var success = options['success'];
        var error = options['error'];
        var data = options['data'];

        try {
            var xhr = new XMLHttpRequest();
        } catch (e) {}

        var is_sane = false;

        if (xhr && "withCredentials" in xhr) {
            xhr.open(type, url, true);
        } else if (typeof XDomainRequest != "undefined") {
        	//Internet Explorer
        	
        	/*
        	 * Check if the client is requesting on a non-secure browser and reset API endpoints accordingly.
        	 */
        	if(window.location.protocol.toLowerCase() === "http:"){
        		//Reset the URL to http:
        		villo.verbose && console.log("Changing Ajax request from https to http.");
        		villo.verbose && console.log(url.search(/https:/gi));
        		url = url.replace(/https:/gi, "http:");
        	}else if(window.location.protocol.toLowerCase() === "https:"){
        		//Reset the URL to https:
        		villo.verbose && console.log("Changing Ajax request from http to https.");
        		villo.verbose && console.log(url.search(/http:/gi));
        		url = url.replace(/http:/gi, "https:");
        	}else{
        		//Not HTTP or HTTPS. We can't do anything else with XDomainRequest!
        		error("Protocol is not supported.");
        		//Stop Running:
        		return false;
        	}
        	
        	villo.verbose && console.log(url);
        	
            xhr = new XDomainRequest();
            xhr.open(type, url);
        } else xhr = null;

        if (!xhr) {
        	error("Ajax is not supported on your browser.");
        } else {
            var handle_load = function (event_type) {
                    return function (XHRobj) {
                        // stupid IExplorer!!!
                        var XHRobj = is_iexplorer() ? xhr : XHRobj;

                        if (event_type == 'load' && (is_iexplorer() || XHRobj.readyState == 4) && success) success(XHRobj.responseText, XHRobj);
                        else if (error) error(XHRobj);
                    }
                };

            try {
                // withCredentials is not supported by IExplorer's XDomainRequest and it has weird behavior anyway
                xhr.withCredentials = false;
            } catch (e) {};

            xhr.onload = function (e) {
                handle_load('load')(is_iexplorer() ? e : e.target)
            };
            xhr.onerror = function (e) {
                handle_load('error')(is_iexplorer() ? e : e.target)
            };
            
            if(type.toLowerCase() === "post"){
            	//There were issues with how Post data was being handled, and setting this managed to fix all of the issues.
            	//Ergo, Villo needs this:
            	if("setRequestHeader" in xhr){
            		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            	}
            }
            xhr.send(data);
        }
	}
})();

/* Villo App */
(function(){
	/*
	 * Generic/Private Functions/Housings
	 */
	villo.app = {
		//Villo.clipboard for copy and paste.
		clipboard: [],
		//All logs from villo.log get dumped here.
		logs: [],
		//A house for the app settings.
		settings: {}
	}
})();

/* Villo Do Functions */
(function(){
	villo.doNothing = function(){
		//We successfully did nothing! Yay!
		return true;
	}, 
	villo.doSomething = function(){
		var strings = [];
		
		for (var i = 0; i < arguments.length; i++) {
			if (typeof(arguments[i] == "object")) {
				strings.push(JSON.stringify(arguments[i]));
			} else {
				strings.push(arguments[i]);
			}
		}
		
		villo.log("Why did you say ", strings, "?!?!?!?!?!");
		if (arguments[0] == "easterEgg") {
			//Easter Egg!
			villo.webLog("IT'S OVER 9000!");
		}
		//Hehehe
		return true;
	}
})();

/* Villo E & Script */
(function(){
	//This code is no longer used:
	/*
	villo.e = {
		load: function(scriptSrc, villoRoot){
			if(villoRoot == false){
				//Load this up from the main app root.
				$script(scriptSrc);
			}else{
				$script(villo.script.get() + scriptSrc);
			}
		}
	}
	*/
	villo.script = {
		get: function(){
			var scripts = document.getElementsByTagName("script");
			for (var i = 0, s, src, l = "villo.js".length; s = scripts[i]; i++) {
				src = s.getAttribute("src") || "";
				if (src.slice(-l) == "villo.js") {
					return src.slice(0, -l - 1) + "/";
				}
			}
		}
	}
})();

/* Villo Extend */
(function(){
	//Undocumented Utility Function:
	villo.mixin = function(destination, source){
		for (var k in source) {
			if (source.hasOwnProperty(k)) {
				destination[k] = source[k];
			}
		}
		return destination;
	}
/**
	villo.extend
	=================
	
	Allows developers to extend Villo functionality by adding methods to the Villo object. As of Villo 1.0, villo.extend actually adds the extend function to the Object prototype.
    
	Calling
	-------

	`villo.extend(object)`
	
	- The only parameter that villo.extend takes is the object. Villo will add the object into the main Villo object. Additionally, if you define a function named "init" in the object, the function will run when the extension is loaded.
	
	Returns
	-------
	
	The function returns the Villo object, or the part of the object you were modifying.
		
	Use
	---
		
		villo.extend({
			suggest:{
				get: function(){
					//Generic function that can be called using villo.
					this.users = ["kesne", "admin"];
					return this.users;
				}
			},
			init: function(){
				//This will be executed when the extension is loaded.
			}
		});
		
	Notes
	-----
	
	Because this function is actually an addition to the Object prototype, you can call it on any part of Villo that is an object.

	For example, to extend the villo.profile, object, you call `villo.profile.extend({"suggest": function(){}});`, which would add the suggest method to villo.profile.
	
	Any methods added through villo.extend will override other methods if they already exist.
	
	If you define an init function in the object, then it will be run when the extension is loaded. The init function will be deleted after it is run.

*/
	Object.defineProperty(Object.prototype, "extend", {
		value: function(obj){
			villo.verbose && console.log("Extending Villo:", this);
			villo.mixin(this, obj);
			if (typeof(this.init) == "function") {
				this.init();
				if(this._ext && this._ext.keepit && this._ext.keepit === true){
					//Do nothing
				}else{
					delete this.init;
				}
			}
			return this;
		},
		writable: true,
		configurable: true,
		enumerable: false
	});
})();
/* Villo Log */
(function(){
/**
	villo.log
	=================
	
    Acts as a wrapper for console.log, logging any parameters you pass it. If no console is available, it pushes it to an object, which you can get using villo.dumpLogs.
    
	Calling
	-------

	`villo.log(anything)`
	
	You can pass this function any arguments.
	
	Returns
	-------
	
	Returns true if the data was logged.
		
	Use
	---
		
		villo.log("test results: ", testResults, {"objects": true}, false);

*/
	villo.log = function(){
		//Inspired by and based on Dave Balmer's Jo app framework (joapp.com).
		var strings = [];
		
		for (var i = 0; i < arguments.length; i++) {
			if (typeof(arguments[i] == "object")) {
				strings.push(JSON.stringify(arguments[i]));
			} else {
				strings.push(arguments[i]);
			}
		}
		
		if (console && console.log) {
			console.log(strings.join(" "));
			//We also push to the variable, just to be sure.
			villo.app.logs[villo.app.logs.length] = strings.join(" ");
		} else {
			//No console, which is a bummer, so just push the data to the variable.
			villo.app.logs[villo.app.logs.length] = strings.join(" ");
		}
		return true;
	}
/**
	villo.webLog
	=================
	
    Acts as a wrapper for console.log, and also passes the log data to Villo, which can be viewed in the Villo Developer Portal. If no console is available, it pushes it to an object, which you can get using villo.dumpLogs.
    
	Calling
	-------

	`villo.webLog(anything)`
	
	You can pass this function any arguments.
	
	Returns
	-------
	
	Returns true if the data was logged.
		
	Use
	---
		
		villo.webLog("test results: ", testResults, {"objects": true}, false);

*/
	villo.webLog = function(){
		//New logging functionality, inspired by Dave Balmer's Jo app framework (joapp.com).
		var strings = [];
		
		for (var i = 0; i < arguments.length; i++) {
			if (typeof(arguments[i] == "object")) {
				strings.push(JSON.stringify(arguments[i]));
			} else {
				strings.push(arguments[i]);
			}
		}
		
		if (console && console.log) {
			console.log(strings.join(" "));
			//We also push to the variable, just to be sure.
			villo.app.logs[villo.app.logs.length] = strings.join(" ");
		} else {
			//No console, which is a bummer, so just push the data to the variable.
			villo.app.logs[villo.app.logs.length] = strings.join(" ");
		}
		
		if (villo.user.username && villo.user.username !== '') {
			var logName = villo.user.username;
		} else {
			var logName = "Guest";
		}
		
		theLog = strings.join(" ")
		
		villo.ajax("http://api.villo.me/log.php", {
			method: 'post',
			parameters: {
				api: villo.apiKey,
				type: "log",
				username: logName,
				appid: villo.app.id,
				log: theLog
			},
			onSuccess: function(transport){
			
			},
			onFailure: function(failure){
			
			}
		});
	}
/**
	villo.dumpLogs
	=================
	
    Get the log data, originating from calls to villo.log or villo.webLog.
    
	Calling
	-------

	`villo.dumpLogs(boolean)`
	
	- Set the boolean to true if you wish to get the logs in JSON format, and not stringified.
	
	Returns
	-------
	
	Returns a stringified version of the logs that are stored in the villo.app.logs object. If you passed "true" to the function, it will return JSON.
		
	Use
	---
		
		//Get the logs
		var logs = villo.dumpLogs(false);
		//Write them out for us to see.
		document.write(logs);

*/
	villo.dumpLogs = function(JSON){
		if(JSON && JSON === true){
			return villo.app.logs;
		}else{
			return JSON.stringify(villo.app.logs);
		}
	}
})();


/* Villo Slash Control */
(function(){
	//Adds slashes into any string to prevent it from breaking the JS.
	villo.addSlashes = function(string){
		string = string.replace(/\\/g, '\\\\');
		string = string.replace(/\'/g, '\\\'');
		string = string.replace(/\"/g, '\\"');
		string = string.replace(/\0/g, '\\0');
		return string;
	},
	villo.stripslashes = function(str){
		return (str + '').replace(/\\(.?)/g, function(s, n1){
			switch (n1) {
				case '\\':
					return '\\';
				case '0':
					return '\u0000';
				case '':
					return '';
				default:
					return n1;
			}
		});
	}
})();
/* Villo Sync */

//TODO: Needs more client-end management on the data-usage end of things. We probably shouldn't ping the server if we open the app twice in a row.

(function(){
	//Private function that is run on initialization.
	villo.sync = function(){
		
		/*
		 * Redeem our voucher.
		 */
		//Create voucher date
		var d = new Date();
		var voucherday = d.getDate() + " " + d.getMonth() + " " + d.getFullYear();
		//Get last voucher date
		if (store.get('voucher')) {
			if (voucherday == store.get('voucher')) {
				villo.syncFeed();
			} else {
				//Today is a new day, let's request ours and set the new date.
				store.set('voucher', voucherday);
				villo.ajax("https://api.villo.me/credits.php", {
					method: 'post',
					parameters: {
						api: villo.apiKey,
						appid: villo.app.id,
						type: "voucher",
						username: villo.user.username,
						token: villo.user.token
					},
					onSuccess: function(){
					},
					onFailure: function(){
					}
				});
			}
		} else {
			//No last voucher date. Set one and request our voucher.
			store.set('voucher', voucherday);
			villo.ajax("https://api.villo.me/credits.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: "voucher",
					username: villo.user.username,
					token: villo.user.token
				},
				onSuccess: function(transport){
				},
				onFailure: function(){
				}
			});
		}
	
	}
	villo.syncFeed = function(){
		var currentTime = new Date().getTime();
		if (store.get("feed")) {
			if (currentTime > (store.get("feed") + 1000000)) {
				store.set('feed', currentTime);
				villo.ajax("https://api.villo.me/credits.php", {
					method: 'post',
					parameters: {
						api: villo.apiKey,
						appid: villo.app.id,
						type: "launch",
						username: villo.user.username,
						token: villo.user.token
					},
					onSuccess: function(transport){
					},
					onFailure: function(){
					}
				});
			} else {
			//It hasn't been long enough since our last check in.
			}
		} else {
			store.set('feed', currentTime);
			villo.ajax("https://api.villo.me/credits.php", {
				method: 'post',
				parameters: {
					api: villo.apiKey,
					appid: villo.app.id,
					type: "launch",
					username: villo.user.username,
					token: villo.user.token
				},
				onSuccess: function(transport){
				},
				onFailure: function(){
				}
			});
		}
	}
})();

/* Villo Dependencies */

/* 
 * Store.js
 * Copyright (c) 2010-2011 Marcus Westin
 */
var store=function(){var b={},e=window,g=e.document,c;b.disabled=false;b.set=function(){};b.get=function(){};b.remove=function(){};b.clear=function(){};b.transact=function(a,d){var f=b.get(a);if(typeof f=="undefined")f={};d(f);b.set(a,f)};b.serialize=function(a){return JSON.stringify(a)};b.deserialize=function(a){if(typeof a=="string")return JSON.parse(a)};var h;try{h="localStorage"in e&&e.localStorage}catch(k){h=false}if(h){c=e.localStorage;b.set=function(a,d){c.setItem(a,b.serialize(d))};b.get=
function(a){return b.deserialize(c.getItem(a))};b.remove=function(a){c.removeItem(a)};b.clear=function(){c.clear()}}else{var i;try{i="globalStorage"in e&&e.globalStorage&&e.globalStorage[e.location.hostname]}catch(l){i=false}if(i){c=e.globalStorage[e.location.hostname];b.set=function(a,d){c[a]=b.serialize(d)};b.get=function(a){return b.deserialize(c[a]&&c[a].value)};b.remove=function(a){delete c[a]};b.clear=function(){for(var a in c)delete c[a]}}else if(g.documentElement.addBehavior){c=g.createElement("div");
e=function(a){return function(){var d=Array.prototype.slice.call(arguments,0);d.unshift(c);g.body.appendChild(c);c.addBehavior("#default#userData");c.load("localStorage");d=a.apply(b,d);g.body.removeChild(c);return d}};b.set=e(function(a,d,f){a.setAttribute(d,b.serialize(f));a.save("localStorage")});b.get=e(function(a,d){return b.deserialize(a.getAttribute(d))});b.remove=e(function(a,d){a.removeAttribute(d);a.save("localStorage")});b.clear=e(function(a){var d=a.XMLDocument.documentElement.attributes;
a.load("localStorage");for(var f=0,j;j=d[f];f++)a.removeAttribute(j.name);a.save("localStorage")})}}try{b.set("__storejs__","__storejs__");if(b.get("__storejs__")!="__storejs__")b.disabled=true;b.remove("__storejs__")}catch(m){b.disabled=true}return b}();


/* 
 * json2.js 
 * Public Domain
 * See http://www.JSON.org/js.html
 */
var JSON;if(!JSON){JSON={};}
(function(){"use strict";function f(n){return n<10?'0'+n:n;}
if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}
function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}
if(typeof rep==='function'){value=rep.call(holder,key,value);}
switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}
v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}
if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}
v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}
if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}
rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}
return str('',{'':value});};}
if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
return reviver.call(holder,key,value);}
text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}
throw new SyntaxError('JSON.parse');};}}());


/* 
 * Script.js
 * See https://github.com/ded/script.js
 */

!function(win, doc, timeout) {
  var head = doc.getElementsByTagName('head')[0],
      list = {}, ids = {}, delay = {}, scriptpath,
      scripts = {}, s = 'string', f = false,
      push = 'push', domContentLoaded = 'DOMContentLoaded', readyState = 'readyState',
      addEventListener = 'addEventListener', onreadystatechange = 'onreadystatechange',
      every = function(ar, fn) {
        for (var i = 0, j = ar.length; i < j; ++i) {
          if (!fn(ar[i])) {
            return f;
          }
        }
        return 1;
      };
      function each(ar, fn) {
        every(ar, function(el) {
          return !fn(el);
        });
      }

  if (!doc[readyState] && doc[addEventListener]) {
    doc[addEventListener](domContentLoaded, function fn() {
      doc.removeEventListener(domContentLoaded, fn, f);
      doc[readyState] = "complete";
    }, f);
    doc[readyState] = "loading";
  }

  function $script(paths, idOrDone, optDone) {
    paths = paths[push] ? paths : [paths];
    var idOrDoneIsDone = idOrDone && idOrDone.call,
        done = idOrDoneIsDone ? idOrDone : optDone,
        id = idOrDoneIsDone ? paths.join('') : idOrDone,
        queue = paths.length;
    function loopFn(item) {
      return item.call ? item() : list[item];
    }
    function callback() {
      if (!--queue) {
        list[id] = 1;
        done && done();
        for (var dset in delay) {
          every(dset.split('|'), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = []);
        }
      }
    }
    timeout(function() {
      each(paths, function(path) {
        if (scripts[path]) {
          id && (ids[id] = 1);
          scripts[path] == 2 && callback();
          return;
        }
        scripts[path] = 1;
        id && (ids[id] = 1);
        create(scriptpath ?
          scriptpath + path + '.js' :
          path, callback);
      });
    }, 0);
    return $script;
  }

  function create(path, fn) {
    var el = doc.createElement("script"),
        loaded = f;
    el.onload = el.onerror = el[onreadystatechange] = function () {
      if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) {
        return;
      }
      el.onload = el[onreadystatechange] = null;
      loaded = 1;
      scripts[path] = 2;
      fn();
    };
    el.async = 1;
    el.src = path;
	el.type = "text/javascript"
    head.insertBefore(el, head.firstChild);
  }

  $script.get = create;

  $script.path = function(p) {
    scriptpath = p
  }
  $script.ready = function(deps, ready, req) {
    deps = deps[push] ? deps : [deps];
    var missing = [];
    !each(deps, function(dep) {
      list[dep] || missing[push](dep);
    }) && every(deps, function(dep) {
      return list[dep];
    }) ? ready() : !function(key) {
      delay[key] = delay[key] || [];
      delay[key][push](ready);
      req && req(missing);
    }(deps.join('|'));
    return $script;
  };

  var old = win.$script;
  $script.noConflict = function () {
    win.$script = old;
    return this;
  };

  (typeof module !== 'undefined' && module.exports) ?
    (module.exports = $script) :
    (win['$script'] = $script);

}(this, document, setTimeout);

/* 
 * PubNub-3.1.js 
 * See http://www.pubnub.com
 * This was moved here due to problemss with the async loader.
 */

function s(){return function(){}}
window.JSON&&window.JSON.stringify||function(){function y(c){k.lastIndex=0;return k.test(c)?'"'+c.replace(k,function(c){var g=f[c];return typeof g==="string"?g:"\\u"+("0000"+c.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+c+'"'}function u(c,f){var g,h,o,m,k=i,l,e=f[c];e&&typeof e==="object"&&typeof e.toJSON==="function"&&(e=e.toJSON(c));typeof p==="function"&&(e=p.call(f,c,e));switch(typeof e){case "string":return y(e);case "number":return isFinite(e)?String(e):"null";case "boolean":case "null":return String(e);
case "object":if(!e)return"null";i+=t;l=[];if(Object.prototype.toString.apply(e)==="[object Array]"){m=e.length;for(g=0;g<m;g+=1)l[g]=u(g,e)||"null";o=l.length===0?"[]":i?"[\n"+i+l.join(",\n"+i)+"\n"+k+"]":"["+l.join(",")+"]";i=k;return o}if(p&&typeof p==="object"){m=p.length;for(g=0;g<m;g+=1)h=p[g],typeof h==="string"&&(o=u(h,e))&&l.push(y(h)+(i?": ":":")+o)}else for(h in e)Object.hasOwnProperty.call(e,h)&&(o=u(h,e))&&l.push(y(h)+(i?": ":":")+o);o=l.length===0?"{}":i?"{\n"+i+l.join(",\n"+i)+"\n"+
k+"}":"{"+l.join(",")+"}";i=k;return o}}window.JSON||(window.JSON={});if(typeof String.prototype.toJSON!=="function")String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()};var k=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,i,t,f={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},p;typeof JSON.stringify!=="function"&&(JSON.stringify=function(c,
f,g){var h;t=i="";if(typeof g==="number")for(h=0;h<g;h+=1)t+=" ";else typeof g==="string"&&(t=g);if((p=f)&&typeof f!=="function"&&(typeof f!=="object"||typeof f.length!=="number"))throw Error("JSON.stringify");return u("",{"":c})});typeof JSON.parse!=="function"&&(JSON.parse=function(c){return eval("("+c+")")})}();
window.PUBNUB||function(){function y(a){var b={},d=a.publish_key||"pub-42c6b905-6d4e-4896-b74f-c1065ab0dc10",q=a.subscribe_key||"sub-4e37d063-edfa-11df-8f1a-517217f921a4",r=a.ssl?"s":"",v="http"+r+"://"+(a.origin||"pubsub.pubnub.com"),n={history:function(a,b){var b=a.callback||b,d=a.limit||100,j=a.channel,c=e();if(!j)return f("Missing Channel");if(!b)return f("Missing Callback");w({c:c,url:[v,"history",q,z(j),c,d],b:function(a){b(a)},a:function(a){f(a)}})},time:function(a){var b=e();w({c:b,url:[v,"time",b],b:function(b){a(b[0])},a:function(){a(0)}})},uuid:function(a){var b=
e();w({c:b,url:["http"+r+"://pubnub-prod.appspot.com/uuid?callback="+b],b:function(b){a(b[0])},a:function(){a(0)}})},analytics:function(a){var b=e(),c=a.limit||100,j=a.ago||0,f=a.duration||100,v=a.callback;w({c:b,b:function(a){v(a)},a:function(){v(0)},url:[["http"+r+"://pubnub-prod.appspot.com/analytics-channel?callback="+b,"sub-key="+q,"pub-key="+d,"channel="+z(a.channel||""),"limit="+c,"ago="+j,"duration="+f].join("&")]})},publish:function(a,b){var b=b||a.callback||s(),c=a.message,j=a.channel,r=
e();if(!c)return f("Missing Message");if(!j)return f("Missing Channel");if(!d)return f("Missing Publish Key");c=JSON.stringify(c);c=[v,"publish",d,q,0,z(j),r,z(c)];if(c.join().length>1800)return f("Message Too Big");w({c:r,b:function(a){b(a)},a:function(){b([0,"Disconnected"])},url:c})},unsubscribe:function(a){a=a.channel;if(a in b)b[a].d=0,b[a].e&&b[a].e(0)},subscribe:function(a,d){function r(){var a=e();if(b[j].d)b[j].e=w({c:a,url:[m,"subscribe",q,z(j),a,h],a:function(){setTimeout(r,A);n.time(function(a){a||
i()})},b:function(a){b[j].d&&(k||(k=1,l()),g=C.set(q+j,h=g&&C.get(q+j)||a[1]),c(a[0],function(b){d(b,a)}),setTimeout(r,10))}})}var j=a.channel,d=d||a.callback,g=a.restore,h=0,i=a.error||s(),k=0,l=a.connect||s(),m=N(v);if(!D)return I.push([a,d,n]);if(!j)return f("Missing Channel");if(!d)return f("Missing Callback");if(!q)return f("Missing Subscribe Key");j in b||(b[j]={});if(b[j].d)return f("Already Connected");b[j].d=1;r()},db:C,each:c,map:G,css:H,$:t,create:l,bind:h,supplant:g,head:o,search:p,attr:m,
now:k,unique:u,events:B,updater:i,init:y};return n}function u(){return"x"+ ++O+""+ +new Date}function k(){return+new Date}function i(a,b){function d(){c+b>k()?(clearTimeout(q),q=setTimeout(d,b)):(c=k(),a())}var q,c=0;return d}function t(a){return document.getElementById(a)}function f(a){console.log(a)}function p(a,b){var d=[];c(a.split(/\s+/),function(a){c((b||document).getElementsByTagName(a),function(a){d.push(a)})});return d}function c(a,b){if(a&&b)if(typeof a[0]!="undefined")for(var d=0,c=a.length;d<
c;)b.call(a[d],a[d],d++);else for(d in a)a.hasOwnProperty&&a.hasOwnProperty(d)&&b.call(a[d],d,a[d])}function G(a,b){var d=[];c(a||[],function(a,c){d.push(b(a,c))});return d}function g(a,b){return a.replace(P,function(a,c){return b[c]||a})}function h(a,b,d){c(a.split(","),function(a){function c(a){if(!a)a=window.event;if(!d(a))a.cancelBubble=true,a.returnValue=false,a.preventDefault&&a.preventDefault(),a.stopPropagation&&a.stopPropagation()}b.addEventListener?b.addEventListener(a,c,false):b.attachEvent?
b.attachEvent("on"+a,c):b["on"+a]=c})}function o(){return p("head")[0]}function m(a,b,d){if(d)a.setAttribute(b,d);else return a&&a.getAttribute&&a.getAttribute(b)}function H(a,b){for(var d in b)if(b.hasOwnProperty(d))try{a.style[d]=b[d]+("|width|height|top|left|".indexOf(d)>0&&typeof b[d]=="number"?"px":"")}catch(c){}}function l(a){return document.createElement(a)}function e(){return E||n()?0:u()}function z(a){return G(encodeURIComponent(a).split(""),function(a){return"-_.!~*'()".indexOf(a)<0?a:"%"+
a.charCodeAt(0).toString(16).toUpperCase()}).join("")}function w(a){function b(a,b){if(!f)f=1,a||i(b),d.onerror=null,clearTimeout(g),setTimeout(function(){a&&h();var b=t(e),d=b&&b.parentNode;d&&d.removeChild(b)},A)}if(E||n())return Q(a);var d=l("script"),c=a.c,e=u(),f=0,g=setTimeout(function(){b(1)},F),h=a.a||s(),i=a.b||s();window[c]=function(a){b(0,a)};d[J]=J;d.onerror=function(){b(1)};d.src=a.url.join(K);m(d,"id",e);o().appendChild(d);return b}function Q(a){function b(a){if(!e){e=1;clearTimeout(g);
if(c)c.onerror=c.onload=null,c.abort&&c.abort(),c=null;a&&h()}}function d(){if(!f){f=1;clearTimeout(g);try{response=JSON.parse(c.responseText)}catch(a){return b(1)}i(response)}}var c,e=0,f=0,g=setTimeout(function(){b(1)},F),h=a.a||s(),i=a.b||s();try{c=n()||window.XDomainRequest&&new XDomainRequest||new XMLHttpRequest,c.onerror=function(){b(1)},c.onload=d,c.timeout=F,c.open("GET",a.url.join(K),true),c.send()}catch(k){return b(0),E=0,w(a)}return b}function L(){PUBNUB.time(k);PUBNUB.time(function(){setTimeout(function(){D||
(D=1,c(I,function(a){a[2].subscribe(a[0],a[1])}))},A)})}function n(){if(!M.get)return 0;var a={id:n.id++,send:s(),abort:function(){a.id={}},open:function(b,c){n[a.id]=a;M.get(a.id,c)}};return a}window.console||(window.console=window.console||{});console.log||(console.log=(window.opera||{}).postError||s());var C=function(){var a=window.localStorage;return{get:function(b){return a?a.getItem(b):document.cookie.indexOf(b)==-1?null:((document.cookie||"").match(RegExp(b+"=([^;]+)"))||[])[1]||null},set:function(b,
c){if(a)return a.setItem(b,c)&&0;document.cookie=b+"="+c+"; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/"}}}(),O=1,P=/{([\w\-]+)}/g,J="async",K="/",F=14E4,A=1E3,E=navigator.userAgent.indexOf("MSIE 6")==-1,N=function(){var a=Math.floor(Math.random()*9)+1;return function(b){return b.indexOf("pubsub")>0&&b.replace("pubsub","ps"+(++a<10?a:a=1))||b}}(),B={list:{},unbind:function(a){B.list[a]=[]},bind:function(a,b){(B.list[a]=B.list[a]||[]).push(b)},fire:function(a,b){c(B.list[a]||[],function(a){a(b)})}},
x=t("pubnub")||{},D=0,I=[];PUBNUB=y({publish_key:m(x,"pub-key"),subscribe_key:m(x,"sub-key"),ssl:m(x,"ssl")=="on",origin:m(x,"origin")});H(x,{position:"absolute",top:-A});if("opera"in window||m(x,"flash"))x.innerHTML="<object id=pubnubs type=application/x-shockwave-flash width=1 height=1 data=https://dh15atwfs066y.cloudfront.net/pubnub.swf><param name=movie value=https://dh15atwfs066y.cloudfront.net/pubnub.swf /><param name=allowscriptaccess value=always /></object>";var M=t("pubnubs")||{};h("load",
window,function(){setTimeout(L,0)});PUBNUB.rdx=function(a,b){if(!b)return n[a].onerror();n[a].responseText=unescape(b);n[a].onload()};n.id=A;window.jQuery&&(window.jQuery.PUBNUB=PUBNUB);typeof module!=="undefined"&&(module.f=PUBNUB)&&L()}();


/*
 * Crossdomain Ajax Handler:
 */
/*
var crossdomain = (function () {

    //
    // We really need this path.  You have to either set it from the
    // external document loading this script, or load the script from
    // a <script src="... tag
    //
    try {
        var CROSSDOMAINJS_PATH = CROSSDOMAINJS_PATH;
    } catch (e) {
        var CROSSDOMAINJS_PATH = null;
    }

    //
    // Detecting absolute path of this script, if not set in the
    // external document.
    //
    if (!CROSSDOMAINJS_PATH) {
        var scripts = document.getElementsByTagName("script")
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].getAttribute('src');
            if (src && src.match(/crossdomain-ajax.js/)) {
                CROSSDOMAINJS_PATH = src.replace("crossdomain-ajax.js", '');
                break;
            }
        }

        // is the path relative to our document?
        if (CROSSDOMAINJS_PATH && !CROSSDOMAINJS_PATH.match(/^(https?|HTTPS?):\/\//) && CROSSDOMAINJS_PATH.substring(0, 1) != '/') CROSSDOMAINJS_PATH = (window.location + '').replace(/[^\/]*$/, '') + CROSSDOMAINJS_PATH;

        // we cannot go on without it
        //if (!CROSSDOMAINJS_PATH) 
        //throw "crossdomain-ajax.js cannot work without CROSSDOMAINJS_PATH. Please set it before loading this script.";
    }

    // used by async_load_javascript
    var FILES_INCLUDED = {};
    var FILES_LOADING = {}; // for avoiding race conditions
    var REGISTERED_CALLBACKS = {};

    //
    // Used to test if an object is a primitive or an Object.
    //
    function type(obj) {
        return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1]
    }

    function is_iexplorer() {
        return navigator.userAgent.indexOf('MSIE') != -1
    }

    // used by async_load_javascript
    function register_callback(file, callback) {
        if (!REGISTERED_CALLBACKS[file]) REGISTERED_CALLBACKS[file] = new Array();
        REGISTERED_CALLBACKS[file].push(callback);
    }

    // used by async_load_javascript
    function execute_callbacks(file) {
        while (REGISTERED_CALLBACKS[file].length > 0) {
            var callback = REGISTERED_CALLBACKS[file].pop();
            if (callback) callback();
        }
    }

    //
    // Loads a Javascript file asynchronously, executing a `callback`
    // if/when file gets loaded.
    //
    function async_load_javascript(file, callback) {
        register_callback(file, callback);

        if (FILES_INCLUDED[file]) {
            execute_callbacks(file);
            return true;
        }
        if (FILES_LOADING[file]) return false;

        FILES_LOADING[file] = true;

        var html_doc = document.getElementsByTagName('head')[0];
        js = document.createElement('script');
        js.setAttribute('type', 'text/javascript');
        js.setAttribute('src', file);
        html_doc.appendChild(js);

        js.onreadystatechange = function () {
            if (js.readyState == 'complete' || js.readyState == 'loaded') {
                if (!FILES_INCLUDED[file]) {
                    FILES_INCLUDED[file] = true;
                    execute_callbacks(file);
                }
            }
        };

        js.onload = function () {
            if (!FILES_INCLUDED[file]) {
                FILES_INCLUDED[file] = true;
                execute_callbacks(file);
            }
        };

        return false;
    }

    //
    // Does a request using flXHR (the Flash module).
    // Assumes flXHR.js is already loaded.
    //
    function _ajax_with_flxhr(options) {
    	return false;
        var url = options['url'];
        var type = options['type'] || 'GET';
        var success = options['success'];
        var error = options['error'];
        var data = options['data'];

        function handle_load(XHRobj) {
            if (XHRobj.readyState == 4) {
                if (XHRobj.status == 200 && success) success(XHRobj.responseText, XHRobj);
                else error(XHRobj);
            }
        }

        var flproxy = new flensed.flXHR({
            autoUpdatePlayer: false,
            instanceId: "myproxy1",
            xmlResponseText: false,
            onreadystatechange: handle_load,
            loadPolicyURL: CROSSDOMAINJS_PATH + "load-policy.xml"
        });

        flproxy.open(type, url, true);
        flproxy.send(data);
    }

    //
    // Does an ajax request.
    //
    // For browsers that do not support CORS, it fallbacks to a flXHR
    // request.
    //
    // Arguments:
    //
    //    url: the request's URL
    //    type: HTTP verb, as in "GET", "POST", "PUT", "DELETE"
    //    success: JS callback to be executed on success
    //    error: JS callback to be executed on error
    //	  data: data to send in case of POST (it's a string, this
    //	         method does not do form-encoding)
    //  
    // NOTE: withCredentials does not work in IExplorer or with flXHR
    //       I would advise against using it.
    //
    function ajax(options) {
        var url = options['url'];
        var type = options['type'] || 'GET';
        var success = options['success'];
        var error = options['error'];
        var data = options['data'];

        try {
            var xhr = new XMLHttpRequest();
        } catch (e) {}

        var is_sane = false;

        if (xhr && "withCredentials" in xhr) {
            xhr.open(type, url, true);
        } else if (typeof XDomainRequest != "undefined") {
            xhr = new XDomainRequest();
            xhr.open(type, url);
        } else xhr = null;

        if (!xhr) {
        	error("Ajax is not supported on your browser.");
        } else {
            var handle_load = function (event_type) {
                    return function (XHRobj) {
                        // stupid IExplorer!!!
                        var XHRobj = is_iexplorer() ? xhr : XHRobj;

                        if (event_type == 'load' && (is_iexplorer() || XHRobj.readyState == 4) && success) success(XHRobj.responseText, XHRobj);
                        else if (error) error(XHRobj);
                    }
                };

            try {
                // withCredentials is not supported by IExplorer's
                // XDomainRequest, neither it is supported by flXHR
                // and it has weird behavior anyway
                xhr.withCredentials = false;
            } catch (e) {};

            xhr.onload = function (e) {
                handle_load('load')(is_iexplorer() ? e : e.target)
            };
            xhr.onerror = function (e) {
                handle_load('error')(is_iexplorer() ? e : e.target)
            };
            if(type.toLowerCase() === "post"){
            	//Villo needs this:
            	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }
            xhr.send(data);
        }
    }

    return {
        ajax: ajax,
        async_load_javascript: async_load_javascript
    }
})();

*/

/* Villo Ending File */

//As per the 1.0 plans, we don't load the info.villo.js file automatically, so check for the legacy variable.
if ("VILLO_SETTINGS" in window && VILLO_SETTINGS.USELEGACY === true) {
	villo.verbose && console.log("Using legacy setting, automatically loading info.villo.");
	//Load up info.villo as a javascript file.
	$script(villo.script.get() + "info.villo.js");
}else{
	villo.verbose && console.log("Villo Library Loaded");
}