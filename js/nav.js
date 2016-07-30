
var navigation = document.getElementById('navigation');
var filename = window.location.pathname.split('/').pop();

function addNavigationRow(title, url, icon) {
  var href = newHref(newIcon(icon), url);
  href.className = "mdl-navigation__link mdl-color-text--blue-grey-200";
  if (url == filename) {
    href.className += " active";
  }
  href.appendChild(document.createTextNode(" " + title));
  return href;
}
navigation.appendChild(addNavigationRow('Milestones', 'index.html', 'flag'));
navigation.appendChild(addNavigationRow('Roadmap', 'roadmap.html', 'map'));
navigation.appendChild(addNavigationRow('Repos', 'repos.html', 'code'));
navigation.appendChild(addNavigationRow('Assigned', 'assigned.html', 'person'));
navigation.appendChild(addNavigationRow('Newbie-friendly', 'newbie.html', 'favorite'));
navigation.appendChild(addNavigationRow('CI', 'ci.html', 'done_all'));
var spacer = document.createElement('div');
spacer.className = "mdl-layout-spacer";
navigation.appendChild(spacer);
var clear = addNavigationRow('Clear local cache', '#', 'delete');
clear.setAttribute("id", "clear");
clear.onclick = function(event) {
  event.stopPropagation();
  localStorage.clear();
  return false;
}
navigation.appendChild(clear);
