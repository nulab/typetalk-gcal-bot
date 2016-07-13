var calendars = [
  "nulab.co.jp_xxxxxxxxxxxxxxxxxx@resource.calendar.google.com"
];

function doPost(e){
  var json = e.postData.getDataAsString();
  var data = JSON.parse(json);
  var message = data.post.message;
  var tokens = message.trim().split(/\s/);
  tokens.shift();
  if(tokens.length == 0){
    postToTypetalk(['Usage: mention me with "today" "tomorrow" or specified days like "2016/7/7 2016/7/8..."']);
  }
  for(var i in tokens) {
    var token = tokens[i];
    if(token == "today"){
      remindOfDay(new Date());
      continue;
    }
    if(token == "tomorrow") {
      remindOfDay(new Date(new Date().getTime() + 86400000));
      continue;
    }
    var d = Date.parse(token);
    if(isNaN(d)){
      continue;
    }
    remindOfDay(new Date(d));
  }
}

function remindOfDay(eventDate){
  var messages = ["Events in " + formatDate(eventDate) + "\n"];
  messages = messages.concat(getEvents(eventDate));
  if(messages.length < 2){
    messages.push("Nothing found...");
  }
  postToTypetalk(messages);
}

function BookingReminder() {
  CalendarApp.setTimeZone("Asia/Tokyo");
  var today = new Date();
  var messages = ["Today's events\n"];
  messages = messages.concat(getEvents(today));
  if(messages.length > 1){
    postToTypetalk(messages);
  }
}

function getEvents(eventDate){
  var messages = [];
  for(var i in calendars){
    messages = messages.concat(getEventsFromCalendar(calendars[i], eventDate));
  }
  return messages;
}

function postToTypetalk(messages){
  var params = {
    method: "POST",
    payload: { message: messages.join("\n") }
  };
  
  UrlFetchApp.fetch("https://typetalk.in/api/v1/topics/xxx?typetalkToken=XXXXXXXXXXXXX", params);
}

function getEventsFromCalendar(calendarId, eventDate){
  var cal = CalendarApp.getCalendarById(calendarId);
  var messages = [];
  if(cal === null){
   return messages; 
  }
  var events = cal.getEvents(getLocalDate(eventDate, 0, 0, 0), getLocalDate(eventDate,23,59,59));
  for(var i in events){
    var e = events[i];
    if(e.isAllDayEvent()){
      messages.push("... " + e.getTitle() + " (All day)");
    }else{
      messages.push("... " + e.getTitle() + " (" + formatTime(e.getStartTime()) + "~" + formatTime(e.getEndTime()) + ")");
    }
  }
  if(messages.length > 0){
    messages.unshift("<<" + cal.getName() + ">>");
  }
  return messages;
}

function getLocalDate(d, hour, min, sec){
  return new Date(d.getYear(), d.getMonth(), d.getDate(), hour, min, sec);
}

function formatDate(d){
 return Utilities.formatDate(d, "Asia/Tokyo", "YYYY/MM/dd");
}

function formatTime(d){
  return Utilities.formatDate(d, "Asia/Tokyo", "HH:mm");
}
