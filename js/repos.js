$(function() {
  var tbody = $('#container table tbody');
  requestGitHubAPI('/orgs/material-motion/repos', function(repos) {
    sortRepos(repos).forEach(function(repo) {
      repo = preprocessRepo(repo);

      var row = document.createElement('tr');
      tbody.append(row);

      function newColumn(contentNode) {
        var column = document.createElement('td');
        if (contentNode) {
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

      newTextColumn(newHref(repo.shortName, repo.html_url));
      newTextColumn(document.createTextNode(repo.description));
      newTextColumn(repo.has_wiki ? newIcon('check_circle') : null);
      newTextColumn(repo.has_issues ? newIcon('check_circle') : null);
      newTextColumn(repo.has_pages ? newHref(newIcon('check_circle'), "https://" + repo.owner.login + ".github.io/" + repo.name + "/") : null);
      newTextColumn(document.createTextNode(repo.default_branch));
      
      console.log(repo);
      
      didCreateRepoNode(repo, row);
    });
  });
  
});