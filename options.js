// Saves options to chrome.storage
function save_options() {
  var no_results = document.getElementById('no_results').value;
  chrome.storage.sync.set({
    no_results: no_results
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    no_results: 10,
  }, function(items) {
    document.getElementById('no_results').value = items.no_results;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);