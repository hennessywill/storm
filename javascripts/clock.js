var min = 1;
var sec = 11;

function initClock(time, duration) {
  // TODO - calculate the time for this section (ideation, discussion, etc.)
  min = parseInt(time.split(":")[0]);
  sec = parseInt(time.split(":")[1]);
  $("#clock").html(getTimeString());
}

function finishStage() {
  // redirect to the next page
  var key = getFirebaseKey();
  if (isDeployed()) {
    window.location.replace("http://www.willhennessy.com/storm/ideation?session="+key);
  } else {
    window.location.replace("/Users/willhennessy/Documents/CS%20598%20-%20Social/storm/ideation.html?&session="+key);
  }
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

updateClock(); // run once to start
setInterval(updateClock,1000);