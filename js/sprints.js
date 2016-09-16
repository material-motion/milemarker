$(function() {
  var tbody = $('#container table tbody');
  requestGitHubAPI('/orgs/' + owner_name + '/repos', function(repos) {
    sortRepos(repos).forEach(function(repo) {
      repo = preprocessRepo(repo);

      requestGitHubAPI('/repos/' + owner_name + '/' + repo.name + '/projects', function(projects) {
        projects.forEach(function(project) {
          if (project.name == 'Current sprint') {
            project = preprocessProject(project, repo);

            var row = document.createElement('tr');
            tbody.append(row);

            var starNode = newStarButton(project, project.html_url);
            row.appendChild(newTextColumn(starNode));
            row.appendChild(newTextColumn(newHref(repo.shortName, project.html_url)));

            requestGitHubAPI('/repos/' + owner_name + '/' + repo.name + '/projects/' + project.number + '/columns', function(columns) {
              var table = document.createElement('table');
              var thead = document.createElement('thead');
              table.appendChild(thead);
              var theadrow = document.createElement('tr');
              thead.appendChild(theadrow);
              var bodyrow = document.createElement('tr');
              table.appendChild(bodyrow);
              columns.forEach(function(column) {
                theadrow.appendChild(newTextColumn(column.name));
                var contentColumn = newColumn();
                bodyrow.appendChild(contentColumn);
                requestGitHubAPI('/repos/' + owner_name + '/' + repo.name + '/projects/columns/' + column.id + '/cards', function(cards) {
                  contentColumn.innerHTML = ''+cards.length;
                });
              });
              row.appendChild(newColumn(table));
            });

            didCreateFilterableNode(project, row, starNode);
          }
        });
      });
    });
  });
});
