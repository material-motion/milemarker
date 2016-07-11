$(function() {
  var md = new Remarkable({
    linkify: true
  });

  requestGitHubAPI('/orgs/material-motion/repos', function(repos) {
    sortRepos(repos).forEach(function(repo) {
      repo = preprocessRepo(repo);

      // Fetch this repo's milestones.

      requestGitHubAPI('/repos/material-motion/' + repo.name + '/milestones', {
        state: 'open',
        sort: 'due_on'
      }, function(milestones) {
        milestones.forEach(function(milestone) {
          var card = createMilestoneCard.bind(this)(milestone);
          $('#container .open').append(card);
        }, repo);
      }.bind(repo));

      requestGitHubAPI('/repos/material-motion/' + repo.name + '/milestones', {
        state: 'closed',
        sort: 'due_on'
      }, function(milestones) {
        milestones.forEach(function(milestone) {
          var card = createMilestoneCard.bind(this)(milestone);
          $('#container .closed').append(card);
        }, repo);
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
      var pluralText = milestone.open_issues == 1 ? "issue remains" : "issues remain";
      links.appendChild(document.createTextNode(milestone.open_issues + " " + pluralText + " out of " + totalIssues));
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
    didCreateRepoNode(this, card);
    return card;
  }
});
