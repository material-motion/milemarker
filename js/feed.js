$(function() {
  var tbody = $('#container table tbody');
  requestGitHubAPI('/users/' + localStorage.getItem('oauth-name') + '/events/orgs/material-motion', function(events) {
    console.log(events.length);
    events.forEach(function(event) {
      console.log(event);
    });
  });
});