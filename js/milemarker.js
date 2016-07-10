$(function() {
  var reposloaded = false;
  var md = new Remarkable({
    linkify: true
  });

  // Invoked when the user clicks the radio buttons.
  function filterDidChange(radio) {
    localStorage.setItem('filter', radio.value);
    $('#container .mdl-card').hide();
    $('.tag-' + radio.value).show();
  }

  // Add event listeners to each radio button.
  var radioButtons = document.filter.filterby;
  for(var i = 0; i < radioButtons.length; i++) {
    radioButtons[i].onclick = function() {
      filterDidChange(this)
    };
  }

  function loadRadioState() {
    var filter = localStorage.getItem('filter');
    if (filter) {
      var radio = document.getElementById('filter-' + filter);
      radio.click();
      filterDidChange(radio);
    } else {
      var radio = document.getElementById('filter-android');
      radio.click();
      filterDidChange(radio);
    }
  }  
  $(document).ready(loadRadioState);

  requestGitHubAPI('/orgs/material-motion/repos', function(repos) {
    repos = repos.sort(function(a, b) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
    repos.forEach(function(repo) {
      var name = repo.name.replace(/^material-motion-/, '').replace(/-android$/, '');
      repo['shortName'] = name;

      var filterClass = 'tag-other';
      if (repo.name.match(/-android$/)) {
        filterClass = 'tag-android';
      } else if (repo.name.match(/-(objc|swift)$/)) {
        filterClass = 'tag-appleos';
      } else if (repo.name.match(/-(web|js)$/)) {
        filterClass = 'tag-web';
      }
      repo['filterClass'] = filterClass;

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
    var pluralText = milestone.open_issues == 1 ? "issue remains" : "issues remain";
    links.appendChild(document.createTextNode(milestone.open_issues + " " + pluralText + " out of " + totalIssues));
    actions.appendChild(links);

    if (totalIssues > 0) {
      var progress = document.createElement('div');
      progress.className = 'mdl-progress mdl-js-progress';
      componentHandler.upgradeElement(progress);
      progress.MaterialProgress.setProgress(milestone.closed_issues / totalIssues * 100);

      actions.appendChild(progress);
    }

    var card = createCard(title, description, actions);
    card.className += " " + this.filterClass;
    if ('tag-' + localStorage.getItem('filter') != this.filterClass) {
      $(card).hide();
    }
    return card;
  }
  
  // Utility methods

  // Create a material lite card.
  function createCard(titleNode, descriptionNode, actionsNode) {
    var card = document.createElement('div');
    card.className = 'mdl-cell mdl-color--white mdl-grid mdl-card mdl-shadow--2dp';
    titleNode.className = 'mdl-card__title';
    descriptionNode.className = 'mdl-card__supporting-text';
    actionsNode.className = 'mdl-card__actions mdl-card--border';
    card.appendChild(titleNode);
    card.appendChild(descriptionNode);
    card.appendChild(actionsNode);
    return card;
  }

  // Cached github request.
  function requestGitHubAPI(path, data, callback) {
    if (typeof callback === 'undefined') {
      callback = data;
      data = undefined;
    }
    var cacheKey = path;
    if (data) {
      cacheKey += "::" + JSON.stringify(data);
    }
    var storage = localStorage.getItem(cacheKey);
    var storageTimestamp = localStorage.getItem(cacheKey + '.timestamp');
    if (storage && storageTimestamp && Date.now() - storageTimestamp < 1 * 1000 ) {
      callback.call(null, JSON.parse(storage));
      return;
    }
    $.ajax({
      type: 'get',
      url: 'https://api.github.com' + path,
      data: data,
      complete: function(xhr) {
        localStorage.setItem(cacheKey, JSON.stringify(xhr.responseJSON));
        localStorage.setItem(cacheKey + '.timestamp', Date.now());
        callback.call(null, xhr.responseJSON);
      }
    });
  }
});
