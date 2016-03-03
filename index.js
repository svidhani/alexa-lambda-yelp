/**
 * App ID for the skill
 */
var APP_ID = "your app id"; 

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var yelp = require('node-yelp');


var RestaurantFinder = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
RestaurantFinder.prototype = Object.create(AlexaSkill.prototype);
RestaurantFinder.prototype.constructor = RestaurantFinder;

RestaurantFinder.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("RestaurantFinder onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

RestaurantFinder.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("RestaurantFinder onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to restaurant finder. What type of restaurant you want me to find?";
    var repromptText = "Do you want only a particular cuisine?";
    
    response.ask(speechOutput, repromptText);
};

RestaurantFinder.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("RestaurantFinder onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

RestaurantFinder.prototype.intentHandlers = {
    // register custom intent handlers
    "RestaurantFinderIntent": function (intent, session, response) {
      handleRequest(intent, session, response);  
      //response.tellWithCard("Hello World!", "Restaurants", "Hello World!");
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say find me best Indian Restaurants!");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the RestaurantFinder skill.
    var restaurantFinder = new RestaurantFinder();
    restaurantFinder.execute(event, context);
};


var handleRequest = function(intent, session, response){

    var client = yelp.createClient({
    oauth: {
      'consumer_key': 'your key',
      'consumer_secret': 'your secret',
      'token': 'your token',
      'token_secret': 'your token secret'
    },

    // Optional settings:
    httpClient: {
      maxSockets: 25 
    }
  });

	var cuisine = (intent.slots.Cuisine && intent.slots.Cuisine.value) ? intent.slots.Cuisine.value : 'indian food';
	var location = (intent.slots.Location && intent.slots.Location.value) ? intent.slots.Location.value : 'Seattle';
	var limit = (intent.slots.Limit && intent.slots.Limit.value) ? intent.slots.Limit.value : 5;

  client.search({
    term: cuisine,
    location: location,
    sort: 2,
    limit: limit
  }).then(function (data) {
      
    var text = '';
    for(var i=0; i<data.businesses.length;i++){
      text += data.businesses[i].name + '<break time = \"0.5s\"/>';
      text += 'Rating: ' + data.businesses[i].rating + '<break time = \"0.5s\"/>';      
    };
    response.tellWithCard(text, "Restaurants", text);
  });  
};

