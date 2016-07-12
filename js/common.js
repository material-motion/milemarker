var md = new Remarkable({
  linkify: true
});

// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
  url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Invoked when the user clicks the radio buttons.
function filterDidChange(radio) {
  localStorage.setItem('filter', radio.value);
  $('#container .filterable-node').hide();
  $('.tag-' + radio.value).show();
  
  var href = window.location.href.replace(/\?.+/, '');
  window.history.replaceState(null, null, href + "?filterby=" + radio.value);
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
  actionsNode.className = 'mdl-card__supporting-text';
  descriptionNode.className = 'mdl-card__actions mdl-card--border';
  card.appendChild(titleNode);
  card.appendChild(actionsNode);
  card.appendChild(descriptionNode);
  return card;
}

function newStarButton() {
  var starButton = document.createElement('a');
  starButton.href = '#starme';
  starButton.onclick = function(event) {
    if (this.childNodes[0].innerHTML == 'star') {
      this.childNodes[0].innerHTML = 'star_border';
    } else {
      this.childNodes[0].innerHTML = 'star';
    }
    return false;
  };
  starButton.appendChild(newIcon('star_border'));
  return starButton;
}

// Create a material lite icon.
// @param icon the icon identifier, as defined at https://design.google.com/icons/
//             Example: check_circle
function newIcon(icon) {
  var node = document.createElement('i');
  node.className = "mdl-color-text--blue-grey-200 material-icons";
  node.setAttribute('role', "presentation");
  node.innerHTML = icon;
  return node;
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
    var filter = getParameterByName('filterby') || localStorage.getItem('filter');
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
