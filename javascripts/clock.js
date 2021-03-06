var min = 99;
var sec = 99;
var ideas = null; // array of ideas from db
var numIdeasCompleted = 0;
var intervalID = 0;

function isWithinOneHour(now, start) {
  var diff = start.getTime() - now.getTime();
  return diff >= 0 && diff < 3600000; // 1hr in ms
}

/* Init for stage 1 (definition) */
function initBeginClock(startDate, startTime, duration) {
  var now = new Date();
  var start = new Date(startDate+","+startTime);
  var diff = start.getTime() - now.getTime();

  if (diff < 0) { // session already started
  	finishStage();
  } else {
    min = Math.floor(diff/1000/60);
    sec = Math.floor((diff/1000) % 60)
    startClock();
  }
}

/* init for stage 2 (ideation) */
function initIdeationClock(startDate, startTime, duration) {
  min = 8;
  sec = 0;
  startClock();
}

function initDiscussionClock(startDate, startTime, duration) {
  min = 0;
  sec = 10;

  numIdeasCompleted = parseInt(getParameterByName("numIdeasCompleted"));
  console.log(numIdeasCompleted);

  $("#clock").html(getTimeString());
  updateDiscussionClock(); // run once to start
  intervalID = setInterval(updateDiscussionClock,1000);
}

function initElectionClock(startDate, startTime, duration) {
  min = 1;
  sec = 30;
  startClock();
}

function initDecisionClock(startDate, startTime, duration) {
  min = 0;
  sec = 10;
  startClock();
}

function updateDiscussionClock() {
  if (min == 0 && sec == 0 && ideas === null) {
  	fetchIdeas();
  } else if (min == 0 && sec == 0 && !isDiscussionDone()) { 
    displayNextIdea();
    min = 0;
    sec = 40;
    $("#clock").html(getTimeString());
  } else if (min == 0 && sec == 0 && isDiscussionDone()) {
  	finishStage();
  } else {
	sec -= 1;
	if (sec < 0) {
	  min -= 1;
	  sec = 59;
	}
	$("#clock").html(getTimeString());
  }
}

/* Loads the ideas from the db and assigns them to 'ideas' var */
function fetchIdeas() {
  var key = getFirebaseKey();
  var ref = new Firebase(getSessionUrl(key));
  ref.once("value", function(snapshot) {
    var session = snapshot.val();
    ideas = session.ideas;
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
}

/* Replace the title and description with the next one */
function displayNextIdea() {
  var currIdea = ideas[numIdeasCompleted];
  $("#title").html(currIdea.title);
  $("#description").html(currIdea.description);
  numIdeasCompleted += 1;
  $("#counter").html("  ("+numIdeasCompleted+"/"+ideas.length+")");
}

/* Returns true if every topic has been discussed */
function isDiscussionDone() {
  return numIdeasCompleted >= ideas.length;
}

/* route the appropriate finish function */
function finishStage() {
  clearInterval(intervalID);
  var stage = getCurrentStage();
  if (stage === "begin")
  	finishBegin();
  else if (stage === "ideation")
  	finishIdeation();
  else if (stage === "discussion")
  	finishDiscussion();
  else if (stage === "election")
  	finishElection();
  else if (stage === "decision")
  	finishDecision();
  else
  	alert("Sorry, an error occured");
}

function finishBegin() {
  var key = getFirebaseKey();
  if (isDeployed())
    window.location.replace("http://www.willhennessy.com/storm/ideation?session="+key);
  else
  	window.location.replace("/Users/willhennessy/Documents/CS%20598%20-%20Social/storm/ideation.html?&session="+key);
}

function finishIdeation() {
  submitToFirebase();
}

function finishDiscussion() {
  if (window.location.href.indexOf("round=2") > -1) {
    // redirect to election page
    if (isDeployed()) {
      window.location.replace("http://www.willhennessy.com/storm/election?session="+getFirebaseKey());
    } else {
      window.location.replace("/Users/willhennessy/Documents/CS%20598%20-%20Social/storm/election.html?session="+getFirebaseKey());
    }
  }
  else {
    // redirect back to ideation page for more ideas (with round=2 param)
    if (isDeployed()) {
      window.location.replace("http://www.willhennessy.com/storm/ideation?round=2&session="+getFirebaseKey());
    } else {
      window.location.replace("/Users/willhennessy/Documents/CS%20598%20-%20Social/storm/ideation.html?round=2&session="+getFirebaseKey());
    }
  }
}

function finishElection() {
  submitVotes();
}

function finishDecision() {
  displayDecision();
  return;
}

function startClock() {
  $("#clock").html(getTimeString());
  updateClock(); // run once to start
  intervalID = setInterval(updateClock,1000);
}

function updateClock() {
  if (min == 0 && sec == 0) {
  	finishStage();
  	return;
  }

  sec -= 1;
  if (sec < 0) {
  	min -= 1;
  	sec = 59;
  }

  $("#clock").html(getTimeString());
}

function getTimeString() {
  if (min > 59)
    return "--:--";
  if (min < 10)
    var m = "0" + min;
  else
  	var m = min.toString();
  if (sec < 10)
  	var s = "0" + sec;
  else
  	var s = sec.toString();

  return m + ":" + s;
}
