$(function() {
  var tbody = $('#container table tbody');
  requestGitHubAPI('/search/issues', {q: "is:open user:material-motion label:\"Newbie friendly\" label:\"flow: Ready for action\" no:assignee"}, function(results) {
    results.items.forEach(function(issue) {
      issue = preprocessIssue(issue);

      var row = document.createElement('tr');
      tbody.append(row);

      function newColumn(contentNode) {
        var column = document.createElement('td');
        if (typeof contentNode == 'string') {
          column.innerHTML = contentNode;
        } else if (contentNode) {
          column.appendChild(contentNode);
        }
        row.appendChild(column);
        return column;
      }

      function newTextColumn(contentNode) {
        var column = newColumn(contentNode);
        column.className = "mdl-data-table__cell--non-numeric";
        return column;
      }

      function newHref(text, href) {
        var node = document.createElement('a');
        node.href = href;
        node.appendChild(typeof text == 'string' ? document.createTextNode(text) : text);
        return node;
      }

      function newIcon(icon) {
        var node = document.createElement('i');
        node.className = "mdl-color-text--blue-grey-200 material-icons";
        node.setAttribute('role', "presentation");
        node.innerHTML = icon;
        return node;
      }

      newTextColumn(newStarButton(issue.html_url));
      newTextColumn(newHref(issue.repoShortName, issue.repo_html_url));
      newTextColumn(newHref(issue.title, issue.html_url));
      newTextColumn(md.render(issue.body));
      
      didCreateFilterableNode(issue, row);
    });
  });
  
});