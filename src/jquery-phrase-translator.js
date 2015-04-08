/****************************************************************************
	jquery-phrase-translator, Multi-language translation of phrases

	(c) 2015, Niels Holt

	https://github.com/NielsHolt/jquery-phrase-translator
	https://github.com/NielsHolt

	Based on https://github.com/coolbloke1324/jquery-lang-js

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";

	function PhraseTranslator( options ) {
		var self = this;
		this.phrases = this.phrases || {};
		this.options = $.extend( { 
			languageId		:'en', 
			altLanguageId	:'en', 
			classNames		: '',		//string classes separeted by space
			onlyLang			: '',
			fileName			:'phrases.xml', 
			callback			:null,
			monitorAttr		:false,
			debug					:true,
			attrList			:['title', 'alt', 'placeholder']

		}, options ) ;

		//Create childrenSelector, globalSelector, and classRegExp (regexp) to check if elements has one of the classes in options.classNames
		this.childrenSelector = '[lang' + (this.options.onlyLang ? '="'+this.options.onlyLang+'"' : '') + ']';
		this.globalSelector		= ':not(html)'+this.childrenSelector;
		this.classRegExp = '';


		var i, nextClass, classList = this.options.classNames.split(' ');
		for (i=0; i<classList.length; i++ ){
			nextClass = $.trim( classList[i] );
			if (nextClass){
				this.classRegExp += (this.classRegExp?'|':'') + '\s' + nextClass + '\s';			  
				this.childrenSelector += ',.'+nextClass;
				this.globalSelector		+= ',.'+nextClass;
			}
		}
		this.classRegExp = this.classRegExp ? this.classRegExp = new RegExp(this.classRegExp) : null;
		
		// Store existing mutation methods so we can auto-run translations when new data is added to the page
		this._jQueryMutationCopies = {
			append	: $.fn.append,
			appendTo: $.fn.appendTo,
			prepend	: $.fn.prepend,
			before	: $.fn.before,
			after		: $.fn.after,
			html		: $.fn.html,

			text		: $.fn.text,
			attr		: $.fn.attr,
			prop		: $.fn.prop
		};

		//'Save' original version of text, attr, and prop. 
		this.fnGetText = function fnGetText($element						) { return this._jQueryMutationCopies.text.call( $element); };
		this.fnSetText = function fnSetText($element, arg1			) { return this._jQueryMutationCopies.text.call( $element, arg1); };
		this.fnGetAttr = function fnGetAttr($element, arg1			) { return this._jQueryMutationCopies.attr.call( $element, arg1); };
		this.fnSetAttr = function fnSetAttr($element, arg1, arg2) { return this._jQueryMutationCopies.attr.call( $element, arg1, arg2); };

		// Now override the existing mutation methods with our own
		$.fn.append		= function () { return self._jQueryMutation(this, 'append'	, arguments); };
		$.fn.appendTo = function () { return self._jQueryMutation(this, 'appendTo', arguments); };
		$.fn.prepend	= function () { return self._jQueryMutation(this, 'prepend'	, arguments); };
		$.fn.before		= function () { return self._jQueryMutation(this, 'before'	, arguments); };
		$.fn.after		= function () { return self._jQueryMutation(this, 'after'		, arguments); };
		$.fn.html			= function () { return self._jQueryMutation(this, 'html'		, arguments); };

		$.fn.text			= function () { return self._jQueryMutation(this, 'text'		, arguments); };
		$.fn.prop			= function () { return self._jQueryMutation(this, 'prop'		, arguments); };

		if (this.options.monitorAttr){
			$.fn.attr			= function () { return self._jQueryMutation(this, 'attr'		, arguments); };
		}

		//**************************************************************
		//_jQueryMutation overwrites
		this._jQueryMutation = function _jQueryMutation(context, method, args) { 
			var result = this._jQueryMutationCopies[method].apply(context, args),
					$context = $(context),
					$contextLang = this.fnGetAttr($context, 'lang'),
					$contextClass = this.fnGetAttr($context, 'class');


			if	(
						( $contextLang && ( !this.options.onlyLang || (this.options.onlyLang == $contextLang) ) ) ||
						( this.classRegExp && ($contextClass !== undefined) && this.classRegExp.test(' ' + $contextClass +' ') ) 
					){			
				//If it is a request for text or html => just return the result
				if ((args.length === 0) && ((method=='text') || (method=='html'))){
					return result;			  
				}

				//If it is a prop or attr => transelate attributes (if assigned) and return the result
				if ((method=='attr') || (method=='prop')){
					if ( (args.length >= 2) || $.isPlainObject( args[0] ) ){
						this._translateAttr( $context );
					}	
					return result;			  
				}	
				this._translateElement( $context );
			}	
			this._translateAll( $context );
			return result;			
		};
		

		//**************************************************************
		this._isValidPhraseId = function _isValidPhraseId( phraseId ){
			return phraseId ? phraseId.charAt(0) == '#' : false;
		};

		//**************************************************************
		this.translatePhrase = function translatePhrase( phraseId, defaultValue ){
			return this._isValidPhraseId(phraseId) ? this.phrases[ phraseId.slice(1) ] : (defaultValue || phraseId);
		};

		//**************************************************************
		this._translateAll = function _translateAll( $selector ){
			$selector = $selector ? $selector.find(this.childrenSelector) : $( this.globalSelector );
			$selector.each( function(){ self._translateElement( $(this) ); });
		};

		//**************************************************************
		this._translateElement = function _translateElement( $element ){
			var contents = '',
					phraseData = $element.data('phrase-translator-contents') || '',
					contentsLang = $element.data('phrase-translator-contents-lang') || '',
					translate = (contentsLang != this.options.languageId);

			//Get the contents of the element and check if it is a phrase-code
			var elementIsInput = false;
			// Check if the element is an input element
			if ($element.is('input')) {
				switch (this.fnGetAttr($element, 'type')) {
					case 'button':
					case 'submit':
					case 'reset':
						contents = $element.val();
						elementIsInput = true;
					break;
				}
			} else {
				// Get the (first) text node inside this element
				var $textNode = $element.contents()
												.filter(function () {return this.nodeType === 3; })
												.first();
				contents = this.fnGetText( $textNode ); 
			}

			//If the contents is a phrase-code => use it when translating
			if (this._isValidPhraseId( contents )){ 
				phraseData = contents;							
				translate = true; 
			}

			//If phraseData contains a valid phrse-code => translate it into text
			if (phraseData && translate) {
				contents = this.translatePhrase( phraseData );
			  if (elementIsInput) {
					$element.val( contents );
				} else {
					this.fnSetText( $element, contents ); 
				}
			}

			//Translate the attributes of the element
			this._translateAttr( $element );

			//Set the phrase-translator-contents with the phraseCodes for the different attributes
			$element.data('phrase-translator-contents', phraseData);
			$element.data('phrase-translator-contents-lang', this.options.languageId);
		};
		
		
		//**************************************************************
		this._translateAttr = function _translateAttr( $element ){
			var attr, attrValue,
					phraseData = $element.data('phrase-translator-attr') || {},
					attrLang = $element.data('phrase-translator-attr-lang') || '',
					translate,
					isNewLang = (attrLang != this.options.languageId);
					

			for (var i=0; i<this.options.attrList.length; i++ ){
				translate = isNewLang;
				attr = this.options.attrList[i];
				attrValue = this.fnGetAttr($element, attr) || '';
				//If the $element.attr(attr) is a phrase-code => translate if
				if ( this._isValidPhraseId(attrValue) ){
					phraseData[attr] = attrValue;							
					translate = true; 
				}

				//If phraseData[attr] contains a valid phrse-code => translate it into text
				if (phraseData.hasOwnProperty(attr) && translate) {
					this.fnSetAttr( $element, attr, this.translatePhrase( phraseData[attr] ));
				}	
			}
					
			//Set the data-phrase-translator with the phraseCodes for the different attributes
			$element.data('phrase-translator-attr', phraseData);
			$element.data('phrase-translator-attr-lang', this.options.languageId);
		};
		
		//**************************************************************
		this.select = function select( languageId, altLanguageId ){
			this.options.languageId = languageId;		
			this.options.altLanguageId = altLanguageId || this.options.altLanguageId || 'en';		
			var self = this;
			altLanguageId = this.options.altLanguageId;
			$.ajax({
				url					: this.options.fileName,
				async : false,
				contentType	: "application/x-www-form-urlencoded;charset=iso-8859-1",

				success			: function(xml) { 
												//Find all <phrase> and add them to languagePack and _languageTexts
												$(xml).find('phrase').each(function(){
													var $this		 = $(this),
															phraseId = self.fnGetAttr($this, 'id'), 
															transTxt = $this.find(languageId).text();
													if (!transTxt && altLanguageId){
														transTxt = $this.find(altLanguageId).text();  
														if (self.options.debug)
														  console.log('"' + phraseId +'" not found in language "' + languageId + '". Used "'+transTxt+'" from "'+altLanguageId+'" instead');
													}
													self.phrases[phraseId] = transTxt;
												});
												self.options.languageId = languageId;		
												self.options.altLanguageId = altLanguageId || this.options.altLanguageId || 'en';		
												self._translateAll();

												if (self.options.callback)
												  self.options.callback( self );
											},
					error			: function (err) {
												console.log('Error loading ' + self.options.fileName + '. Error='+err.statusText);
											}
			});
		};

		//**************************************************************
		//Load the data when $(document).ready
		$(function () {
			//Load phrases from xml-file
			self.select( self.options.languageId, self.options.altLanguageId );		
		});
	}
  
  // expose access to the constructor
  window.PhraseTranslator = PhraseTranslator;

}(jQuery, this, document));
