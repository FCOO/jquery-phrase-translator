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
			fileName			:'phrases.xml', 
			attrList			:['title', 'alt', 'placeholder'],
	
			debug:true 
		}, options ) ;
		
		// Store existing mutation methods so we can auto-run translations when new data is added to the page
		this._mutationCopies = {
			append	: $.fn.append,
			appendTo: $.fn.appendTo,
			prepend	: $.fn.prepend,
			before	: $.fn.before,
			after		: $.fn.after,
			html		: $.fn.html,

			prop		: $.fn.prop
		};
		
		// Now override the existing mutation methods with our own
		$.fn.append		= function () { return self._mutation(this, 'append'	, arguments); };
		$.fn.appendTo = function () { return self._mutation(this, 'appendTo', arguments); };
		$.fn.prepend	= function () { return self._mutation(this, 'prepend'	, arguments); };
		$.fn.before		= function () { return self._mutation(this, 'before'	, arguments); };
		$.fn.after		= function () { return self._mutation(this, 'after'		, arguments); };
		$.fn.html			= function () { return self._mutation(this, 'html'		, arguments); };

		$.fn.prop			= function () { return self._mutation(this, 'prop'		, arguments); };

		//**************************************************************
		//_mutation overwrites
		this._mutation = function _mutation(context, method, args) {
			var i, attr, propValues;
			var translate = true;
			var isPropAssign = (method == 'prop') && ( (args.length == 2) || $.isPlainObject( args[0] ) );
			
			//If it is $.fn.prop: Save all the properties listed in options.attrList and check if any are changed.
			if (isPropAssign){
				propValues = {};
				for (i=0; i<this.options.attrList.length; i++ ){
					attr = this.options.attrList[i];
					propValues[attr] = this._mutationCopies[method].apply(context, [attr]);
				}
			}	

			var result = this._mutationCopies[method].apply(context, args);

			//If it is $.fn.prop: Save all the properties listed in options.attrList and check if any are changed.
			if (isPropAssign){
				translate = false;
				for (i=0; i<this.options.attrList.length; i++ ){
					attr = this.options.attrList[i];
					if (propValues[attr] !== this._mutationCopies[method].apply(context, [attr]) ){
						translate = true;
						break;
					}
				}
			}			
			
			if (translate){
				var $context = $(context);
				this.translateElement( $context );
				this._translateAll( $context );
			}
			return result;
		};
		
		//**************************************************************
		this._isPhraseCode = function _isPhraseCode( phraseCode ){
			return phraseCode ? phraseCode.charAt(0) == '#' : false;
		};

		//**************************************************************
		this._translatePhraseCode = function _translatePhraseCode( phraseCode ){
			return this._isPhraseCode(phraseCode) ? this.phrases[ phraseCode.slice(1) ] : '';
		};

		//**************************************************************
		this._translateAll = function _translateAll( $selector ){
			$selector = $selector ? $selector.find('[lang]') : $(':not(html)[lang]');
			$selector.each( function(){ self.translateElement( $(this) ); });
		};

		//**************************************************************
		this.translateElement = function translateElement( $element ){
			if ( $element.attr('lang')) {
		
				//Get the data-phrase-translator (if any) with the phraseCodes for the different attributes
				var phraseData = $element.data('phrase-translator') || {};

				//Get the contents of the element and check if it is a phrase-code
				var contents = '';
				var elementIsInput = false;
				// Check if the element is an input element
				if ($element.is('input')) {
					switch ($element.attr('type')) {
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
					contents = $textNode.text();
				}

				//If the contents is a phrase-code => use it when translating
				if (this._isPhraseCode( contents ))
					phraseData.contents = contents;					  
				
				var translation = this._translatePhraseCode( phraseData.contents );							
				if (translation){
				  if (elementIsInput) {
						$element.val( translation );
					} else {
						$element.text( translation );
					}
				}

				//Get the attributes of the element
				for (var i=0; i<this.options.attrList.length; i++ ){
					var attr = this.options.attrList[i];
					contents = $element.attr(attr);
					//If the attr-contents is a phrase-code => use it when translating
					if (this._isPhraseCode( contents ))
						phraseData[attr] = contents;					  
				
					translation = this._translatePhraseCode( phraseData[attr] );							
					if (translation)
						$element.attr(attr, translation);
				}

				//Set the data-phrase-translator with the phraseCodes for the different attributes
				$element.data('phrase-translator', phraseData);
			}
		};
		
		
		
		
		//**************************************************************
		this.select = function select( languageId, altLanguageId ){
			this.options.languageId = languageId;		
			this.options.altLanguageId = altLanguageId || this.options.altLanguageId || 'en';		
			var self = this;
			languageId = this.options.languageId;
			altLanguageId = this.options.altLanguageId;

			$.ajax({
				url					: this.options.fileName,
				contentType	: "application/x-www-form-urlencoded;charset=iso-8859-1",
				success: function(xml) { 
						//Find all <phrase> and add them to languagePack and _languageTexts
						$(xml).find('phrase').each(function(){
							var phraseId	= $(this).attr('id'); 
							var transTxt	= $(this).find(languageId).text();
							if (!transTxt && altLanguageId){
								transTxt = $(this).find(altLanguageId).text();  
								console.log('"' + phraseId +'" not found in language "' + languageId + '". Used "'+transTxt+'" from "'+altLanguageId+'" instead');
							}
							self.phrases[phraseId] = transTxt;
						});
						self._translateAll();
					},
					error: function (err) {
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



