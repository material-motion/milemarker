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

          var owner = null;
          var owner_html = null;
          var m;
          if ((m = /owner: (.+?)$/.exec(milestone.description)) !== null) {
            owner = m[1];
            if (owner == 'jverkoey') {
              owner_html = "https://github.com/jverkoey";
              owner = 'featherless';
            } else {
              owner_html = "https://github.com/" + owner;
            }
          }

          var date = null;
          if (milestone.closed_at) {
            date = milestone.closed_at;
          } else if (milestone.due_on) {
            date = milestone.due_on;
          } else {
            return;
          }

          row.setAttribute('data-date', date);

          var due_date = moment(date);

          var starNode = newStarButton(repo, repo.html_url);
          row.appendChild(newTextColumn(starNode));
          row.appendChild(newTextColumn(owner ? newHref(owner, owner_html) : null));
          row.appendChild(newTextColumn((milestone.state == 'closed') ? newIcon('check_circle') : null));
          row.appendChild(newTextColumn(newHref(repo.shortName, repo.html_url)));
          row.appendChild(newTextColumn(newHref(milestone.title, "https://github.com/" + repo.owner.login + "/" + repo.name + "/milestone/" + milestone.number)));
          row.appendChild(newTextColumn(due_date.fromNow()));

          var totalIssues = milestone.closed_issues + milestone.open_issues;
          if (totalIssues > 0) {
            var progress = document.createElement('div');
            progress.className = 'mdl-progress mdl-js-progress';
            componentHandler.upgradeElement(progress);
            progress.MaterialProgress.setProgress(milestone.closed_issues / totalIssues * 100);
            progress.setAttribute('style', 'width: 100px');

            row.appendChild(newColumn(progress));
          }

          tbody.append(row);

          didCreateFilterableNode(repo, row, starNode);
        }, repo);

        didFinishRepo(repo);
      }.bind(repo));
    });
  });
});
