/* Author: Me! */

$(document).ready(function() {
	
	var container = $("#main-inner")
	
	var elements = {
		list: $('.main-list-content', container),
		pane: $('.main-content', container)
	};
	
	var icon = $('<span />').addClass('loader');
	
	elements.list.find('.list-item').hover(function() {
		$(this).toggleClass('list-item-hovered');
	});
	
	elements.list.delegate('.list-item', 'click', function(){
		var url = $(this).find('a.list-item-trigger').attr('href');
		elements.pane
			.empty()
			.append(icon)
			.load(url);
			
		return false;
	});
	
	elements.list.delegate('a.list-item-trigger', function(){			
		return false;
	});
});






















