(function($){
	$.fn.expanderGrid = function(opt) {
		var settings = $.extend({
			// selector for "item" that will append template for expander
			item: 'li', 
			// selector for element in template that responds to click to expand
			clicker: 'a', 
			// selector for element in template that responds to click to close
			closer: '.close', 
			// class added to item when expanded
			expandedClass: 'expanded', 
			// animation speed
			speed: 'fast', 
			// id attribute of js template
			template: '',
			// function called when expander opens
			onOpen: null,
			// function called when expander closes
			onClose: null,
			// additional margin added below expander box in px
			margin: 20
		}, opt);

		return this.each(function(){
			var self = this;
			$(this).on('click', settings.closer, function(e){
				e.stopPropagation();
				e.preventDefault();
				hideExpander();
			})
			.on('click', settings.clicker, function(e){
				e.stopPropagation();
				e.preventDefault();
				var $item = $(this).parents(settings.item);
				if ($item.hasClass(settings.expandedClass)) {
					hideExpander();
				}
				else {
					showExpander($item);
				}
			});
		});

		function showExpander($item){
			var ex = $item.data('expander');
			if (ex) {
				ex.update();
				ex.open();
				return false;
			}
			ex = new Expander($item, settings);
			$item.data('expander', ex);
			ex.open();
		}

		function hideExpander(){
			var ex = $('.' + settings.expandedClass).data('expander');
			if (ex) {
				ex.close();
			}
		}

	}; // end $.fn

	//------------------------------------
	// micro templating
	// @see http://ejohn.org/blog/javascript-micro-templating/
	var tplCache = {};
	function tpl(str, data) {
		var fn = !/\W/.test(str) ? 
			tplCache[str] = tplCache[str] || 
				tpl($('#' + str).html()) :
			new Function('obj', 
				"var p=[],print=function(){p.push.apply(p,arguments);};" +
				"with(obj){p.push('" +
				str
					.replace(/[\r\t\n]/g, " ")
					.split("<%").join("\t")
					.replace(/((^|%>)[^\t]*)'/g, "$1\r")
					.replace(/\t=(.*?)%>/g, "',$1,'")
					.split("\t").join("');")
					.split("%>").join("p.push('")
					.split("\r").join("\\'")
				+ "');}return p.join('');");
			return data ? fn(data) : fn;
	}

	//------------------------------------

	function Expander($item, settings){
		this.$item = $item;	
		this.settings = settings;
		this.create();
	}

	Expander.prototype = {
		create: function(){
			this.$elem = $(tpl(this.settings.template, this.$item.data()));
			this.$item.append(this.$elem);
			this.update();
		},
		update: function(){
			this.$elem.css({visibility: 'hidden'});
			this.itemHeight = this.$item.height();
			this.elemHeight = this.$elem.height();
			this.$elem.hide().css({visibility: 'visible'});
		},
		open: function(){
			var $expanded = $('.' + this.settings.expandedClass),
				htSpeed = this.settings.speed, 
				itemTop = this.$item.offset().top,
				winHeight = $(window).height(),
				elemDiff = 0,
				scrollTo;
			if ($expanded.length > 0) {
				var ex = $expanded.data('expander'),
					exTop = $expanded.offset().top;
				if (elemDiff > 0) elemDiff = 0;
				if (exTop == itemTop) {
					htSpeed = false;
				}
				else if (exTop < itemTop) {
					elemDiff = ex.elemHeight;
				}
				if (ex) {
					ex.close(htSpeed);
				}
			}

			this.$item.addClass(this.settings.expandedClass);
			var hDiff = (this.elemHeight + this.settings.margin);
			if (htSpeed) {
				this.$item.animate({height: '+=' + hDiff}, htSpeed);
				this.$elem.slideDown(htSpeed);
			}
			else {
				this.$item.css({height: '+=' + hDiff});
				this.$elem.show();
			}

			// scroll to show if necessary
			if ((this.elemHeight + this.itemHeight) < winHeight) {
				scrollTo = itemTop;
			}
			else if (this.elemHeight < winHeight) {
				scrollTo = itemTop + (winHeight - this.elemHeight);
			}
			else {
				scrollTo = itemTop + (this.itemHeight / 2);
			}
			scrollTo -= elemDiff;
			$('html, body').animate({scrollTop : scrollTo}, this.settings.speed);
			
			if (typeof this.settings.onOpen == 'function') {
				this.settings.onOpen.apply(this);
			}
		},
		close: function(){
			var speed = arguments[0] !== undefined ? arguments[0] : this.settings.speed;
			this.$item.removeClass(this.settings.expandedClass);
			if (speed) {
				this.$item.animate({height: this.itemHeight}, speed);
				this.$elem.slideUp(speed)
			}
			else {
				this.$item.css({height: this.itemHeight});
				this.$elem.hide();
			} 
			if (typeof this.settings.onClose == 'function') {
				this.settings.onClose.apply(this);
			}
		},
	}; // Expander.prototype

}(jQuery));