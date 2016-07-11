$(function() {
  var tbody = $('#container table tbody');
  requestGitHubAPI('/orgs/material-motion/repos', function(repos) {
    sortRepos(repos).forEach(function(repo) {
      repo = preprocessRepo(repo);

      var row = document.createElement('tr');
      tbody.append(row);

      function newColumn(text) {
        var column = document.createElement('td');
        column.className = "mdl-data-table__cell--non-numeric";
        column.appendChild(document.createTextNode(text));
        row.appendChild(column);
        return column;
      }

      newColumn(repo.shortName);
      newColumn(repo.description);

      didCreateRepoNode(repo, row);
    });
  });
  
});