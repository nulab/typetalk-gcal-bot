var calendars = [
  "nulab.co.jp_xxxxxxxxxxxxxxxxxx@resource.calendar.google.com"
];

function remindEvents() {
  CalendarApp.setTimeZone("Asia/Tokyo");
  var today = new Date();
  var messages = ["Today's events\n"];
  for(var i in calendars){
    messages = messages.concat(getEventsFromCalendar(calendars[i], today));
  }
  if(messages.length > 1){
    postToTypetalk(messages);  
  }
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

function formatTime(d){
  return Utilities.formatDate(d, "Asia/Tokyo", "HH:mm");
}
