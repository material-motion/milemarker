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
      var name = repo.name.replace(/^material-motion-/, '');
      repo['shortName'] = name;

      var filterClass = 'tag-other';
      if (repo.name.match(/-android$/)) {
        filterClass = 'tag-android';
      } else if (repo.name.match(/-(objc|swift)$/)) {
        filterClass = 'tag-appleos';
      } else if (repo.name.match(/-(web|js)$/)) {
        filterClass = 'tag-web';
      }

      // Fetch this repo's milestones.

      requestGitHubAPI('/repos/material-motion/' + repo.name + '/milestones', {
        state: 'open',
        sort: 'due_on'
      }, function(milestones) {
        milestones.forEach(function(milestone) {
          var totalIssues = milestone.closed_issues + milestone.open_issues;

          var title = document.createElement('a');
          title.href = "https://github.com/" + this.owner.login + "/" + this.name + "/milestone/" + milestone.number;

          title.appendChild(document.createTextNode(this.shortName + " / " + milestone.title));

          var description = document.createElement('div');
          var descriptionHTML = md.render(milestone.description);
          description.innerHTML = descriptionHTML;

          var actions = document.createElement('div');

          var links = document.createElement('div');
          links.appendChild(document.createTextNode(milestone.open_issues + " issues remain"));
          actions.appendChild(links);

          if (totalIssues > 0) {
            var progress = document.createElement('div');
            progress.className = 'mdl-progress mdl-js-progress';
            componentHandler.upgradeElement(progress);
            progress.MaterialProgress.setProgress(milestone.closed_issues / totalIssues * 100);

            actions.appendChild(progress);
          }

          var card = createCard(title, description, actions);
          card.className += " " + filterClass;
          $('#container').append(card);

          if ('tag-' + localStorage.getItem('filter') != filterClass) {
            $(card).hide();
          }
        }, repo);
      }.bind(repo));
    });
  });
  
  // Utility methods

  // Create a material lite card.
  function createCard(titleNode, descriptionNode, actionsNode) {
    var card = document.createElement('div');
    card.className = 'mdl-card mdl-shadow--2dp';
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
