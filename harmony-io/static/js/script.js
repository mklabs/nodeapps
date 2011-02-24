/* Author: 
 */
(function(w, $){
	
	var socket, sender, id = (new Date()).getTime();
	
	io.setPath('/client/');
    socket = new io.Socket(null, {
        transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling']
    });
    socket.connect();
	
    socket.on('message', function(data) {
	    try {
      		data = JSON.parse(data);
	    } catch (SyntaxError) {
	      log('Invalid JSON:');
	      return false;
	    }
		
		if (sender instanceof jQuery) {
			sender.trigger('draw', [data]);
		}
	});
	
	
	$(document).ready(function() {
		var win = $(w);
		
		sender = $(".demo-main").css({
			height: (win.height() * 0.9)
		}).harmony({ color: ['random']})
		
		// Bind capture event
		.bind('capture', function(e, x, y, color) {
			socket.send(JSON.stringify({
				x: x,
				y: y,
				color: color,
				id: id
			}));
		})
		
		.bind('draw', function(e, data){
			var h = $(this).data('harmony');
			h.update(data);
		});
    
	});
})(window, window.jQuery);