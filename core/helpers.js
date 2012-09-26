// ## Helpers ##
// The following are a list of helper methods used internally to steal
var h = {
// check that we have a document
	doc: win.document,
	// a jQuery-like $.each
	each: function( o, cb ) {
		var i, len;

		// weak array detection, but we only use this internally so don't
		// pass it weird stuff
		if ( typeof o.length == 'number' ) {
			for ( i = 0, len = o.length; i < len; i++ ) {
				cb.call(o[i], i, o[i], o)
			}
		} else {
			for ( i in o ) {
				cb.call(o[i], i, o[i], o)
			}
		}
		return o;
	},
	uniquePush: function(arr, item){
		for(var i=0; i < arr.length; i++){
			if(arr[i] == item){
				return;
			}
		}
		arr.push(item)
	},
	// if o is a string
	isString: function( o ) {
		return typeof o == "string";
	},
	// if o is a function
	isFn: function( o ) {
		return typeof o == "function";
	},
	// dummy function
	noop: function() {},
	endsInSlashRegex: /\/$/,
	// creates an element
	createElement: function( nodeName ) {
		return h.doc.createElement(nodeName)
	},
	// creates a script tag
	scriptTag: function() {
		var start = h.createElement("script");
		start.type = "text/javascript";
		return start;
	},
	// minify-able verstion of getElementsByTagName
	getElementsByTagName: function( tag ) {
		return h.doc.getElementsByTagName(tag);
	},
	// A function that returns the head element
	// creates and caches the lookup for faster
	// performance.
	head: function() {
		var hd = h.getElementsByTagName("head")[0];
		if (!hd ) {
			hd = h.createElement("head");
			h.docEl.insertBefore(hd, h.docEl.firstChild);
		}
		// replace head so it runs fast next time.
		h.head = function() {
			return hd;
		}
		return hd;
	},
	// extends one object with another
	extend: function( d, s ) {
		// only extend if we have something to extend
		s && h.each(s, function( k ) {
			d[k] = s[k];
		});
		return d;
	},
	// makes an array of things, or a mapping of things
	map: function( args, cb ) {
		var arr = [];
		h.each(args, function( i, str ) {
			arr.push(cb ? (h.isString(cb) ? str[cb] : cb.call(str, str)) : str)
		});
		return arr;
	},
	// testing support for various browser behaviors
	// a startup function that will be called when steal is ready
	startup: function() {},
	// if oldsteal is an object
	// we use it as options to configure steal
	opts: (typeof win.steal == "object" ? win.steal : {}),
	// adds a suffix to the url for cache busting
	addSuffix: function( str ) {
		if ( h.opts.suffix ) {
			str = (str + '').indexOf('?') > -1 ? str + "&" + h.opts.suffix : str + "?" + h.opts.suffix;
		}
		return str;
	},
	
		// ## AOP ##
	// Aspect oriented programming helper methods are used to
	// weave in functionality into steal's API.
	// calls `before` before `f` is called.
	//     steal.complete = before(steal.complete, f)
	// `changeArgs=true` makes before return the same args
	before: function(f, before, changeArgs) {
		return changeArgs ?
		function before_changeArgs() {
			return f.apply(this, before.apply(this, arguments));
		} : function before_args() {
			before.apply(this, arguments);
			return f.apply(this, arguments);
		}
	},
	// returns a function that calls `after` 
	// after `f`
	after: function(f, after, changeRet) {
		return changeRet ?
		function after_CRet() {
			return after.apply(this, [f.apply(this, arguments)].concat(h.map(arguments)));
		} : function after_Ret() {
			var ret = f.apply(this, arguments);
			after.apply(this, arguments);
			return ret;
		}
	}
}

h.docEl = h.doc && h.doc.documentElement;

h.support = {
	// does onerror work in script tags?
	error: h.doc && (function() {
		var script = h.scriptTag();
		script.onerror = h.noop;
		return h.isFn(script.onerror) || "onerror" in script
	})(),
	// If scripts support interactive ready state.
	// This is tested later.
	interactive: false,
	// use attachEvent for event listening (IE)
	attachEvent: h.doc && h.scriptTag().attachEvent
}