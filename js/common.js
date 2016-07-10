// Invoked when the user clicks the radio buttons.
function filterDidChange(radio) {
  localStorage.setItem('filter', radio.value);
  $('#container .mdl-card').hide();
  $('.tag-' + radio.value).show();
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
