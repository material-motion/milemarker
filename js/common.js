var md = new Remarkable({
  linkify: true
});

// Invoked when the user clicks the radio buttons.
function filterDidChange(radio) {
  localStorage.setItem('filter', radio.value);
  $('#container .filterable-node').hide();
  $('.tag-' + radio.value).show();
}

var partyMoji = String.fromCodePoint(0x1F389);

function sortRepos(repos) {
 return repos.sort(function(a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
  });
}

function numberWithCommas(x) {
  // http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

function shortNameForRepoName(repoName) {
  return repoName.replace(/^material-motion-/, '').replace(/-android$/, '');
}

function preprocessRepo(repo) {
  repo['shortName'] = shortNameForRepoName(repo.name);

  var filterClass = 'tag-other';
  if (repo.name.match(/-android$/)) {
    filterClass = 'tag-android';
  } else if (repo.name.match(/-(objc|swift)$/)) {
    filterClass = 'tag-appleos';
  } else if (repo.name.match(/-(web|js)$/)) {
    filterClass = 'tag-web';
  }
  repo['filterClass'] = filterClass;
  return repo;
}

function preprocessIssue(issue) {
  var re = /repos\/(.+?)\/(.+?)$/; 
  var m;
 
  if ((m = re.exec(issue.repository_url)) !== null) {
    if (m.index === re.lastIndex) {
      re.lastIndex++;
    }

    issue['repo_html_url'] = "https://github.com/" + m[1] + "/" + m[2];
    issue['repo'] = m[2];
  }

  issue['repoShortName'] = shortNameForRepoName(issue.repo);

  var filterClass = 'tag-other';
  if (issue.repo.match(/-android$/)) {
    filterClass = 'tag-android';
  } else if (issue.repo.match(/-(objc|swift)$/)) {
    filterClass = 'tag-appleos';
  } else if (issue.repo.match(/-(web|js)$/)) {
    filterClass = 'tag-web';
  }
  issue['filterClass'] = filterClass;
  return issue;
}

function shouldHideFilterableNode(object) {
  return 'tag-' + localStorage.getItem('filter') != object.filterClass;
}

function didCreateFilterableNode(object, node) {
  node.className += " filterable-node " + object.filterClass;
  if (shouldHideFilterableNode(object)) {
    $(node).hide();
  }
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
  if (storage && storageTimestamp && Date.now() - storageTimestamp < 5 * 60 * 1000 ) {
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

$(function() {
  // Add event listeners to each radio button.
  var radioButtons = document.filter.filterby;
  for(var i = 0; i < radioButtons.length; i++) {
    radioButtons[i].onclick = function() {
      filterDidChange(this)
    };
  }

  $(document).ready(function() {
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
  
    document.getElementById('clear').onclick = function(event) {
      event.stopPropagation();
      localStorage.clear();
      window.location.reload();
    }
  });
});
