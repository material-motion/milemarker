$(function() {
  var tbody = $('#container table tbody');
  requestGitHubAPI('/search/issues', {q: "is:open user:" + owner_name}, function(results) {
    results.items.forEach(function(issue) {
      if (issue.assignees.length == 0) {
        return;
      }
      issue = preprocessIssue(issue);

      var row = document.createElement('tr');
      tbody.append(row);
      
      var assignees = document.createElement('div');
      for (var i = 0; i < issue.assignees.length; ++i) {
        var avatar = newImage(issue.assignees[i].avatar_url);
        avatar.setAttribute("width", "32");
        assignees.appendChild(avatar);
        assignees.appendChild(newHref(issue.assignees[i].login, issue.assignees[i].html_url));
      }

      var starNode = newStarButton(issue, issue.html_url);
      row.appendChild(newTextColumn(starNode));
      row.appendChild(newTextColumn(newHref(issue.repoShortName, issue.repo_html_url)));
      row.appendChild(newTextColumn(assignees));
      row.appendChild(newTextColumn(newHref(issue.title, issue.html_url)));
      row.appendChild(newTextColumn(md.render(issue.body)));
      
      didCreateFilterableNode(issue, row, starNode);
    });
  });
  
});