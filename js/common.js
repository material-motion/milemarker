var md = new Remarkable({
  linkify: true
});

// Assumes that this site is hosted as a subdomain on github.io.
var owner_name = window.location.hostname.substr(0, window.location.hostname.indexOf('.'));
if (!owner_name) {
  owner_name = 'material-motion';
}

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

function newColumn(contentNode) {
  var column = document.createElement('td');
  if (typeof contentNode == 'string') {
    column.innerHTML = contentNode;
  } else if (contentNode) {
    column.appendChild(contentNode);
  }
  return column;
}

function newTextColumn(contentNode) {
  var column = newColumn(contentNode);
  column.className = "mdl-data-table__cell--non-numeric";
  return column;
}

function newHref(text, href) {
  var node = document.createElement('a');
  node.href = href;
  if (text) {
    node.appendChild(typeof text == 'string' ? document.createTextNode(text) : text);
  }
  return node;
}

function newIcon(icon) {
  var node = document.createElement('i');
  node.className = "mdl-color-text--blue-grey-200 material-icons";
  node.setAttribute('role', "presentation");
  node.innerHTML = icon;
  return node;
}

function newImage(src) {
  var node = document.createElement('img');
  node.src = src;
  return node;
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

function isStarred(object) {
  var value = localStorage.getItem('filter-'+object.starfilterurl);
  if (value == "true") {
    return true;
  }
  return false;
}

function newStarButton(object, url) {
  var starButton = document.createElement('a');
  starButton.href = '#starme';
  object['starfilterurl'] = url;

  if (isStarred(object)) {
    starButton.appendChild(newIcon('star'));
  } else {
    starButton.appendChild(newIcon('star_border'));
  }

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
  var re = new RegExp("^" + owner_name + "-");
  return repoName.replace(re, '').replace(/-android$/, '');
}

function preprocessTravisRepo(repo) {
  repo['shortName'] = shortNameForRepoName(repo.slug.split('/').pop());

  var filterClass = 'tag-other';
  if (repo.slug.match(/-android$/)) {
    filterClass = 'tag-android';
  } else if (repo.slug.match(/-(objc|swift)$/)) {
    filterClass = 'tag-appleos';
  } else if (repo.slug.match(/-(web|js)$/)) {
    filterClass = 'tag-web';
  }
  repo['filterClass'] = filterClass;
  return repo;
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

function preprocessProject(project, repo) {
  project['filterClass'] = repo['filterClass'];
  
  var re = /repos\/(.+?)\/(.+?)$/; 
  var m;
  if ((m = re.exec(project.url)) !== null) {
    if (m.index === re.lastIndex) {
      re.lastIndex++;
    }

    project['html_url'] = "https://github.com/" + m[1] + "/" + m[2];
  }

  return project;
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

function didCreateFilterableNode(object, node, starNode) {
  node.className += " filterable-node " + object.filterClass;
  if (isStarred(object)) {
    node.className += " tag-starred";
  }
  if (shouldHideFilterableNode(object)) {
    $(node).hide();
  }

  starNode.onclick = function(event) {
    if (this.childNodes[0].innerHTML == 'star') {
      localStorage.setItem('filter-'+object.starfilterurl, false);
      this.childNodes[0].innerHTML = 'star_border';
      node.classList.remove('tag-starred');
    } else {
      localStorage.setItem('filter-'+object.starfilterurl, true);
      this.childNodes[0].innerHTML = 'star';
      node.classList.add('tag-starred');
    }
    return false;
  };
}

// Cached github request.
function requestGitHubAPI(path, data, callback, accumulator) {
  requestAPI('https://api.github.com', path, data, callback, accumulator);
}

function requestTravisAPI(path, data, callback, accumulator) {
  requestAPI('https://api.travis-ci.org', path, data, callback, accumulator);
}

// Cached API request
function requestAPI(apibase, path, data, callback, accumulator) {
  if (typeof callback === 'undefined') {
    callback = data;
    data = undefined;
  }
  if (!data) {
    data = {};
  }
  data['per_page'] = 100;
  var cacheKey = apibase + path;
  if (data) {
    var cacheKeyData = {};
    Object.keys(data).forEach(function(key) {
      if (key == 'per_page' || key == 'page') {
        return;
      }
      cacheKeyData[key] = data[key];
    });

    cacheKey += "::" + JSON.stringify(cacheKeyData);
  }
  var storage = localStorage.getItem(cacheKey);
  var storageTimestamp = localStorage.getItem(cacheKey + '.timestamp');
  if (storage && storageTimestamp && Date.now() - storageTimestamp < 5 * 60 * 1000 ) {
    callback.call(null, JSON.parse(storage));
    return;
  }
  $.ajax({
    type: 'get',
    url: apibase + path,
    data: data,
    beforeSend: function(request) {
      var authName = localStorage.getItem('oauth-name');
      var authToken = localStorage.getItem('oauth-token');
      if (authName && authToken) {
        request.setRequestHeader("Authorization", "Basic " + btoa(authName + ":" + authToken));
        request.setRequestHeader("Accept", "application/vnd.github.inertia-preview+json");
      }
    },
    complete: function(xhr) {
      if (accumulator && accumulator['items']) {
        accumulator.items = accumulator.items.concat(xhr.responseJSON.items);
      } else if (accumulator) {
        accumulator = accumulator.concat(xhr.responseJSON);
      } else {
        accumulator = xhr.responseJSON;
      }

      var m;
      if ((m = /<.+?page=(\d+)>; rel="next"/.exec(xhr.getAllResponseHeaders())) !== null) {
        data['page'] = parseInt(m[1]);
        requestGitHubAPI(path, data, callback, accumulator);
      } else {
        localStorage.setItem(cacheKey, JSON.stringify(accumulator));
        localStorage.setItem(cacheKey + '.timestamp', Date.now());
        callback.call(null, accumulator);
      }
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
    var filter = null;
    var queryFilter = getParameterByName('filterby');
    if (typeof queryFilter == 'string') {
      filter = getParameterByName('filterby');
    } else {
      filter = localStorage.getItem('filter');
    }
    if (filter) {
      var radio = document.getElementById('filter-' + filter);
      radio.click();
      filterDidChange(radio);
    } else {
      var radio = document.getElementById('filter-android');
      radio.click();
      filterDidChange(radio);
    }
  });
});
