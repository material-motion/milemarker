$(function() {
  var tbody = $('#container table tbody');
  requestGitHubAPI('/orgs/' + owner_name + '/repos', function(repos) {
    sortRepos(repos).forEach(function(repo) {
      repo = preprocessRepo(repo);

      var row = document.createElement('tr');
      tbody.append(row);

      var starNode = newStarButton(repo, repo.html_url);
      row.appendChild(newTextColumn(starNode));
      row.appendChild(newTextColumn(newHref(repo.shortName, repo.html_url)));
      row.appendChild(newTextColumn(repo.description ? document.createTextNode(repo.description) : null));
      row.appendChild(newTextColumn(repo.has_wiki ? newIcon('check_circle') : null));
      row.appendChild(newTextColumn(repo.has_issues ? newIcon('check_circle') : null));
      row.appendChild(newTextColumn(repo.has_pages ? newHref(newIcon('check_circle'), "https://" + repo.owner.login + ".github.io/" + repo.name + "/") : null));
      row.appendChild(newTextColumn(document.createTextNode(repo.default_branch)));

      didCreateFilterableNode(repo, row, starNode);
    });
  });
  
});