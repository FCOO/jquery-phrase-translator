/****************************************************************************
language.js
Methods and variables to change language
Using jquery-lang-js. See https://github.com/coolbloke1324/jquery-lang-js
*****************************************************************************/

languageSetting = new Setting( 'dk.fcoo.ifm.setting.language');
languageSetting.load();

var language = languageSetting.id || '';

/******************************************
selectLanguage
******************************************/
function selectLanguage( isFirstSelection ){ 
	if (isFirstSelection)
		$('.language-only-when-reselecting').hide()
	else
		$('.language-only-when-reselecting').show();

	//Set selected language-row
	$('#language-table').tableSetSelectedRowById( language );

	//Open the slider
	$('#language-slider').sliderOpenModal( );
}


/******************************************
changeLanguage
******************************************/
function changeLanguage( newLanguage ){
	languageSetting.id = newLanguage;
	var saved = languageSetting.save();

	//Reload the page - if the localStorage faild: Use ?lang=.. instead
	allwaysSaveStateSetting = true;
	reloadPage( saved ? null : {lang: newLanguage} );
}



/*
_languageTexts = JSON-object with the translated name/text of different expressions identified by a uniqe id
The translation of the different expressions is in language.xml
Eq. _languageTexts['#SaveSettingAs'] = 'Gem indstillinger som..' if language=='da'
*/
var _languageTexts = [];


/******************************************
languageText
Simple function to return the text cooresponding with id in _languageTexts
insert = array of {mask, value} where mask is replaced by value in the result
Eq.:
_languageTexts[id] = 'Hello [NAME]!' and insert = {mask:'[NAME]', value:'Niels'} 
return 'Hello Niels!'
******************************************/
function languageText( id, insert, firstUpperCase, allUpperCase ){
	var result = _languageTexts[id] || '***';
	if (insert)
	  for (var i=0; i<insert.length; i++ )
			result = result.replace(insert[i].mask, insert[i].value);  
	if (allUpperCase)
		return result.toUpperCase();  
	if (firstUpperCase)
		return result.charAt(0).toUpperCase() + result.slice(1);  
	return result;
}


/******************************************
languageTranslate
Simple function to check if 'text' is a 
id for a text in _languageTexts
******************************************/
function languageTranslate( text ){
	text = text || '';
	return text.charAt(0) == '#' ? languageText( text ) : text;	
}

/*****************************************************************
If the language is selected: Translate the contents
*****************************************************************/
if (language){ 
	var languagePack = {"token":{}, 'regex':[]};
	//Create languagePack and the translation by loading the data from language.xml into the prototype of Lang
	$.ajax({
		url					: 'web_source/global/language.xml',
		async				: false,
		contentType	: "application/x-www-form-urlencoded;charset=iso-8859-1",
		success:	function(xml) { 
								//Find the alternative language-id to be used if a <text>-record don't have the propper <XX> (XX=language)
								var altLanguage = $(xml).find('language#'+language).attr('altId') || ''; 
								//Find all <text> and add them to languagePack and _languageTexts
								$(xml).find('text').each(function(){
									var transId		= $(this).attr('id'); 
									var transTxt	= $(this).find(language).text();
									if (!transTxt && altLanguage){
										transTxt = $(this).find(altLanguage).text();  
										console.log('"' + transId +'" not found in language "' + language + '". Used "'+transTxt+'" from "'+altLanguage+'" instead');
									};
					
									languagePack.token[transId] = transTxt;
									_languageTexts[transId] = transTxt;
								});

								//Find all direct translation: <trans>
								/* NOT USED ANYMORE
								$(xml).find('trans').each(function(){
									var enTxt			= $(this).find('en').text(); 
									var transTxt	= $(this).find(language).text(); 
									languagePack.token[enTxt] = transTxt;
								});
								*/
								/* NOT USED ANYMORE
								//Find all regular expressions: <regex>
								$(xml).find('regex').each(function(){
									var regEx			= $(this).attr('exp'); 
									var transTxt	= $(this).find(language).text(); 
									languagePack.regex.push( [new RegExp(regEx), transTxt] );
								});
								*/
							},
		error:		function (err) {
								console.log('Error loading language.xml. Error='+err.statusText);
							}
	});

	//Adjust the Lang.prototype by adding attr that should be translated - not used
	//Lang.prototype.attrList.push();
	
	//Create a Lang-object. Using a 'dummy' language 'cl' (current language) to force translation if language is english.
	Lang.prototype.pack['cl'] = languagePack;
	lang = new Lang('en', 'cl');	

	//Setting the names of mounts and weekdays in moment
	moment.locale('cl', {
		months				: languageText('#moment_months'				).split('_'),
		monthsShort		: languageText('#moment_monthsShort'	).split('_'),
		weekdays			: languageText('#moment_weekdays'			).split('_'),
		weekdaysShort	: languageText('#moment_weekdaysShort').split('_'),
		weekdaysMin		: languageText('#moment_weekdaysMin'	).split('_')
	});
}

else
	/*****************************************************************
	No language is selected: Show language-selection-slider
	*****************************************************************/
	globalEvents.onLast('afterinit', function() { selectLanguage( true ); } );

//******************************************
(function($){ //Uses $ as alias for jQuery. (function($){ ... })(jQuery);

	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { 
		$('#language-table').tableClickRow( 
			function(dummy, id) { 
				closeModalSlider( function() { 
					changeLanguage( id ); 
				});
			} 
		);

	}); 

//******************************************
})(jQuery);


