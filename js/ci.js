$(function() {
  var tbody = $('#container table tbody');
  requestTravisAPI('/repos/' + owner_name, {"active": "true"}, function(results) {
    results.forEach(function(repo) {
      if (repo.last_build_status === null) {
        return;
      }

      repo = preprocessTravisRepo(repo);

      var row = document.createElement('tr');
      tbody.append(row);

      console.log(repo);

      var starNode = newStarButton(repo, "https://github.com/" + repo.slug);
      row.appendChild(newTextColumn(starNode));
      row.appendChild(newTextColumn(newHref(repo.shortName, "https://travis-ci.org/" + repo.slug)));
      
      function newBuildStatusBox(result) {
        var icon = newIcon(result == '0' ? 'check' : 'error');
        if (result != 0) {
          icon.className = 'material-icons mdl-color-text--red-200';
        }
        return icon;
      }
      row.appendChild(newTextColumn(newBuildStatusBox(repo.last_build_status)));

      didCreateFilterableNode(repo, row, starNode);
    });
  });
  
});