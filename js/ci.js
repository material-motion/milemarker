$(function() {
  var tbody = $('#container table tbody');
  requestTravisAPI('/repos/' + owner_name, {"active": "true"}, function(results) {
    results.forEach(function(repo) {
      if (repo.last_build_status === null && repo.last_build_started_at === null) {
        return;
      }

      repo = preprocessTravisRepo(repo);

      var row = document.createElement('tr');
      tbody.append(row);

      var starNode = newStarButton(repo, "https://github.com/" + repo.slug);
      row.appendChild(newTextColumn(starNode));
      row.appendChild(newTextColumn(newHref(repo.shortName, "https://travis-ci.org/" + repo.slug)));
      
      function newBuildStatusBox(result) {
        var icon;
        if (result == '0') {
          icon = newIcon('check');
        } else if (repo.last_build_status === null && repo.last_build_finished_at === null) {
          icon = newIcon('autorenew');
        } else {
          icon = newIcon('error');
          icon.className = 'material-icons mdl-color-text--red-200';
        }
        return icon;
      }
      row.appendChild(newTextColumn(newBuildStatusBox(repo.last_build_status)));

      didCreateFilterableNode(repo, row, starNode);
    });
  });
  
});
