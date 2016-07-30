
var navigation = document.getElementById('navigation');

function addNavigationRow(title, url, icon) {
  var href = newHref(newIcon(icon), url);
  href.className = "mdl-navigation__link active mdl-color-text--blue-grey-200";
  href.appendChild(document.createTextNode(title));
  return href;
}
navigation.appendChild(addNavigationRow('Milestones', 'index.html', 'flag'));
navigation.appendChild(addNavigationRow('Roadmap', 'roadmap.html', 'map'));
navigation.appendChild(addNavigationRow('Repos', 'repos.html', 'code'));
navigation.appendChild(addNavigationRow('Assigned', 'assigned.html', 'person'));
navigation.appendChild(addNavigationRow('Newbie-friendly tasks', 'newbie.html', 'favorite'));
var spacer = document.createElement('div');
spacer.className = "mdl-layout-spacer";
navigation.appendChild(spacer);
navigation.appendChild(addNavigationRow('Clear local cache', '#', 'delete'));
