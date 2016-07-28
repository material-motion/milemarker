$(function() {
  requestGitHubAPI('/orgs/' + owner_name + '/repos', function(repos) {
    var remainingRepos = new Set();
    repos.forEach(function(repo) {
      remainingRepos.add(repo.id);
    });

    var tbody = $('#container table tbody');

    function didFinishRepo(repo) {
      remainingRepos.delete(repo.id);

      if (remainingRepos.size == 0) {
        var rows = tbody.children("tr");
        rows = rows.sort(function (prev, next) {
          var prevDate = prev.getAttribute('data-date');
          var nextDate = next.getAttribute('data-date');
          if (prevDate && !nextDate) return -1;
          if (!prevDate && nextDate) return 1;
          if (prevDate < nextDate) return -1;
          if (prevDate > nextDate) return 1;
          return 0;
        });
        rows.detach().appendTo(tbody);
      }
    }

    sortRepos(repos).forEach(function(repo) {
      repo = preprocessRepo(repo);

      // Fetch this repo's milestones.

      requestGitHubAPI('/repos/' + owner_name + '/' + repo.name + '/milestones', {
        state: 'all'
      }, function(milestones) {
        milestones.forEach(function(milestone) {
          var row = document.createElement('tr');

          var starNode = newStarButton(repo, repo.html_url);
          row.appendChild(newTextColumn(starNode));
          row.appendChild(newColumn((milestone.state == 'closed') ? newIcon('check_circle') : null));
          row.appendChild(newTextColumn(newHref(repo.shortName, repo.html_url)));
          row.appendChild(newTextColumn(newHref(milestone.title, "https://github.com/" + repo.owner.login + "/" + repo.name + "/milestone/" + milestone.number)));

          var totalIssues = milestone.closed_issues + milestone.open_issues;
          if (totalIssues > 0) {
            var progress = document.createElement('div');
            progress.className = 'mdl-progress mdl-js-progress';
            componentHandler.upgradeElement(progress);
            progress.MaterialProgress.setProgress(milestone.closed_issues / totalIssues * 100);

            row.appendChild(newColumn(progress));
          }

          if (milestone.closed_at) {
            row.setAttribute('data-date', milestone.closed_at);
          } else if (milestone.due_on) {
            row.setAttribute('data-date', milestone.due_on);
          } else {
            return;
          }

          tbody.append(row);

          didCreateFilterableNode(repo, row, starNode);
        }, repo);

        didFinishRepo(repo);
      }.bind(repo));
    });
  });
});
