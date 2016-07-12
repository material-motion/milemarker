$(function() {
  requestGitHubAPI('/orgs/material-motion/repos', function(repos) {
    var remainingRepos = new Set();
    repos.forEach(function(repo) {
      remainingRepos.add(repo.id);
    });
    
    function didFinishRepo(repo) {
      remainingRepos.delete(repo.id);

      if (remainingRepos.size == 0) {
        function sortCards(container) {
          var cards = container.children(".mdl-card");
          cards = cards.sort(function (prev, next) {
            var prevDate = prev.getAttribute('data-due-on');
            var nextDate = next.getAttribute('data-due-on');
            if (prevDate && !nextDate) return -1;
            if (!prevDate && nextDate) return 1;
            if (prevDate < nextDate) return -1;
            if (prevDate > nextDate) return 1;
            return 0;
          });
          cards.detach().appendTo(container);          
        }
        sortCards($('#container .open'));
        sortCards($('#container .closed'));
      }
    }

    sortRepos(repos).forEach(function(repo) {
      repo = preprocessRepo(repo);

      // Fetch this repo's milestones.

      requestGitHubAPI('/repos/material-motion/' + repo.name + '/milestones', {
        state: 'all',
        sort: 'due_on'
      }, function(milestones) {
        milestones.forEach(function(milestone) {
          var card = createMilestoneCard.bind(this)(milestone);
          if (milestone.state == 'open') {
            $('#container .open').append(card);
            
          } else if (milestone.state == 'closed') {
            $('#container .closed').append(card);
          }
        }, repo);
        
        didFinishRepo(repo);
      }.bind(repo));
    });
  });

  function createMilestoneCard(milestone, parentNode) {
    var totalIssues = milestone.closed_issues + milestone.open_issues;

    var title = document.createElement('div');
    var titleLink = document.createElement('a');
    titleLink.href = "https://github.com/" + this.owner.login + "/" + this.name + "/milestone/" + milestone.number;
    titleLink.appendChild(document.createTextNode(this.shortName + " / " + milestone.title));

    title.appendChild(titleLink);

    var description = document.createElement('div');
    var descriptionHTML = md.render(milestone.description);
    description.innerHTML = descriptionHTML;

    var actions = document.createElement('div');

    var links = document.createElement('div');
    if (milestone.state == 'open') {
      if (totalIssues > 0) {
        var pluralText = milestone.open_issues == 1 ? "issue remains" : "issues remain";
        links.appendChild(document.createTextNode(milestone.open_issues + " " + pluralText + " out of " + totalIssues + " :: "));
      }
      var link = document.createElement('a');
      link.href = "https://github.com/" + this.owner.login + "/" + this.name + "/issues/new?milestone=" + milestone.number;
      link.appendChild(document.createTextNode("File new issue"));
      links.appendChild(link);

    } else {
      links.appendChild(document.createTextNode(partyMoji + " Closed on " + milestone.closed_at.replace(/T.+$/, '') + " " + partyMoji));
    }
    actions.appendChild(links);

    if (totalIssues > 0) {
      var progress = document.createElement('div');
      progress.className = 'mdl-progress mdl-js-progress';
      componentHandler.upgradeElement(progress);
      progress.MaterialProgress.setProgress(milestone.closed_issues / totalIssues * 100);

      actions.appendChild(progress);
    }

    var card = createCard(title, description, actions);
    card.setAttribute('data-due-on', milestone.due_on);
    didCreateFilterableNode(this, card);
    return card;
  }
});
