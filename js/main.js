var reload = false;
var oldurl = ''
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //Get a message from background.js when the url changes
    full_url = window.location.href
    if (oldurl == full_url) {return}
    oldurl = full_url
    if (reload) {
    	location.reload();
    	return
    }
    full_url = window.location.href
    var re = /list=(.+)/
    var url = full_url.match(re)
	if (url == null ) {
		return
	} else { url = url[1]}
	reload = true
	
    
	$(document).ready(function(){
		var $list_search_button = $('<button" id="playlist-search" style="height:99%;" class="yt-uix-button yt-uix-button-size-default yt-uix-button-default search-btn-component" tabindex="3">\
			<span class="yt-uix-button-content">LS</span>&nbsp;List Search</button>');
		// Add our list search button button next to youtube's search button
		$('.search-button').after($list_search_button)
		var vids = []
		var list_name
		var playlist_length
		var iterations = 6
		chrome.storage.sync.get({
			// Get the maximum number of results option set in the Options file
			no_results: 6,
		}, function(items) {
			iterations = items.no_results;
		});

		var iterations = 1
		var playlist_id = url.split('&')[0]
		$.get(
			// Get the number of items in the playlist
			'https://gdata.youtube.com/feeds/api/playlists/' + playlist_id +' ?max-results=1&v=2.1&alt=jsonc&start-index=1',
			function(data) {
				playlist_length = data['data']['totalItems']
				iterations = Math.min(Math.ceil(playlist_length / 50), iterations)
			});
		$('#playlist-search').click(function(){
			var search = document.getElementById('masthead-search-term');
			var search_term = search.value
			if (search_term.length == 0) {return}
			var playlist_videos = 'https://gdata.youtube.com/feeds/api/playlists/' + playlist_id +' ?max-results=50&v=2.1&alt=jsonc&start-index='

			
			var stop = false
			for (i=0;i<iterations;i++) {
				(function(i){
					$.get(
					    playlist_videos + String(i*50 + 1),
					    function(data) {
					    	if(stop) {
					    		return
					    	}
					    	if (data['data'].hasOwnProperty('items') ) {
					    		vids = vids.concat(data['data']['items'])
					    	}
					    	if (i == iterations-1 || vids.length == playlist_length || !data['data'].hasOwnProperty('items') ) {
						       	stop = true
						       	list_name = data['data']['title']
						       	videos()
						    }
						}
					);			
				})(i)
			}

			
		});

		function videos(){
			var options = {
			  keys: ['video.title'],
			  threshold: 0.6
			}
			var search = document.getElementById('masthead-search-term');
			var search_term = search.value
			var f = new Fuse(vids, options);
			var result = f.search(search_term);
			try {
				container = document.getElementById('page-container');
				container.remove();
			} catch (e) {
				container = document.getElementById('content')
				container.remove()
			}
			display_results = []
			for (var i = 0; i < result.length; i++) {
				res_href ='/watch?v=40-oo1S2WEw' + result[i]['id']
				res_name =  result[i]['video']['title']
				display_results.push('<li><div class="yt-lockup yt-lockup-tile yt-lockup-playlist vve-check clearfix yt-uix-tile">\
				 <a href="'+ res_href +'">' + res_name + '</a></div></li>')
			}
			// pos = document.getElementById('masthead-positioner-height-offset');
			$('#body-container').append(' \
				<div  id="content" class="  content-alignment" role="main">\
				<div id="results" align="center"> <ol id="item-section-928883" class="item-section">\
				<li><div class=""> Results in ' + list_name + ' for <i>' + search_term + ':</i></div></li><br> \
				'+ display_results.join(" ") +'</ol></div>  \
				</div>')
		}
	})


});

