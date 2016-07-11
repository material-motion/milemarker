// Invoked when the user clicks the radio buttons.
function filterDidChange(radio) {
  localStorage.setItem('filter', radio.value);
  $('#container .repo-node').hide();
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

function shouldHideRepo(repo) {
  return 'tag-' + localStorage.getItem('filter') != repo.filterClass;
}

function didCreateRepoNode(repo, repoNode) {
  repoNode.className += " repo-node " + repo.filterClass;
  if (shouldHideRepo(repo)) {
    $(repoNode).hide();
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

function preprocessRepo(repo) {
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
  return repo;
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
  });
});
