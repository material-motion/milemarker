$(function() {
  var tbody = $('#container table tbody');
  requestGitHubAPI('/search/issues', {q: "is:open user:" + owner_name + " label:\"Newbie friendly\" label:\"flow: Ready for action\" no:assignee"}, function(results) {
    results.items.forEach(function(issue) {
      issue = preprocessIssue(issue);

      var row = document.createElement('tr');
      tbody.append(row);

      var starNode = newStarButton(issue, issue.html_url);
      row.appendChild(newTextColumn(starNode));
      row.appendChild(newTextColumn(newHref(issue.repoShortName, issue.repo_html_url)));
      row.appendChild(newTextColumn(newHref(issue.title, issue.html_url)));
      row.appendChild(newTextColumn(md.render(issue.body)));
      
      didCreateFilterableNode(issue, row, starNode);
    });
  });
  
});