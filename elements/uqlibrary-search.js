//SOLR (PRIMO) expects a callback function, which is not part of polymer
//TODO: investigate if SOLR can work with JSONP
function dataResponse(data) {
  var searchElement = this.document.querySelector('uqlibrary-search');
  if (typeof(searchElement) !== 'undefined')
    searchElement._suggestionsLoaded( { detail : data} );
}

(function () {
  Polymer({
    is: 'uqlibrary-search',

    properties: {
      /**
       * Application name for google analytics records
       */
      gaAppName: {
        type: String,
        value: 'Search'
      },

      /**
       * List of api for auto suggestions
       */
      api : {
          type: Object,
          value: {
              summonApi: {
                url: 'https://d3nm82zk9ronst.cloudfront.net/metadata/suggest/suggest',
                params:
                  { prefix: '' }
              },
              primoApi: {
                url: 'http://primo-instant-apac.hosted.exlibrisgroup.com:1997/solr/ac',
                params:
                  {
                    'json.wrf' : 'dataResponse',
                    'q' : '',
                    'fq' : 'scope%3A(f62343bc-ab97-488a-ae30-e165629a79be)+AND+context%3A(L+OR+C)', //TODO: replace with proper scope values
                    'wt' : 'json',
                    'facet' : 'off',
                    'rows' : '10'
                  }
              },
              lrApi: {
                url: 'https://app.library.uq.edu.au/api/search_suggestions',
                params: {
                  type : 'learning_resource',
                  prefix: '' }
              },
              examsApi: {
                url: 'https://app.library.uq.edu.au/api/search_suggestions',
                params: {
                  type : 'exam_paper',
                  prefix: ''
                }
              },
              databaseApi: {
                url: 'https://app.library.uq.edu.au/api/search_suggestions',
                params: {
                  type: 'database',
                  prefix: ''
                }
              }
          }
      },

      /**
       * Redirections list after search is prformed
       */
      links : {
          type: Object,
          value: {
              summon: 'http://uq.summon.serialssolutions.com/search?q=',
              primo: 'http://uq-edu-primo.hosted.exlibrisgroup.com/primo_library/libweb/action/search.do',
              exams: 'https://www.library.uq.edu.au/exams/papers.php?stub=',
              lr: 'http://lr.library.uq.edu.au/search?q=',
              database: 'https://www.library.uq.edu.au/resources/database/#/?title=',
              journals: 'https://app.library.uq.edu.au/#/journals?S=AC_T_B&C=',
              catalogue: 'https://library.uq.edu.au/search~S7/X?search='
          }
      },

      /**
       * List of search sources
       */
      sources: {
        type: Array
      },

      /**
       * List of suggestions to display
       */
      suggestions: {
        type: Array
      },

      /**
       * Selected search source index
       */
      selectedSourceIndex: {
        type: Number,
        value: 0,
        observer: '_selectedSourceIndexChanged'
      },

      /**
       * Selected search source
       */
      selectedSource: {
        type: Object,
        notify: true
      },

      /**
       * Selected search source API
       */
      selectedSourceApi: {
        type: String
      },

      /**
       * Max number of recent suggestions
       */
      maxRecentSuggestions: {
        type: Number,
        value: 2
      },

      /**
       * Max number of recent searchers to keep
       */
      maxRecentSearches: {
        type: Number,
        value: 10
      },

      /**
       * Recent searches
       */
      recent: {
        type: Object
      },

      _inputSourcesTarget: {
        type: Object,
        value: function () {
          return this.$.inputSources;
        }
      }
    },

    _selectedSourceIndexChanged: function(newValue, oldValue) {
      if (this.sources) {
        this.selectedSource = this.sources[newValue];
        this.$.menuSources.close();
        this._sourceSelected();
      }
    },

    _searchActivated: function(e) {

      var searchText = e.detail.name ? e.detail.name : this.$.searchKeywordInput.keyword;
      var selectedSuggestion = e.detail.name ? e.detail : null;
      var searchUrl = '';
      var recent = {name: searchText, origName: searchText, type: this.selectedSource.type, recent: true};

      if (selectedSuggestion &&
          (this.selectedSource.type === 'databases' || this.selectedSource.type === 'learning_resources')) {
        searchUrl = selectedSuggestion.url;
      }

      if (!searchUrl) {
        if (this.selectedSource.type === 'learning_resources' || this.selectedSource.type === 'exam_papers') {
          var s = searchText.split(" ");
          searchText = s[0];
        }
        else if (this.selectedSource.type === 'catalogue') {
          searchText = this._cleanSearchQuery(searchText);
        }
        searchUrl = encodeURI(this.selectedSource.url + searchText);
        if (this.selectedSource.urlAppend) {
          searchUrl += this.selectedSource.urlAppend;
        }
      } else {
        recent.url = searchUrl;
      }

      this._saveRecentSearch(recent);

      this.async(function () {
        document.location.href = searchUrl;
      }, 100);

      this.$.inputSources.value = this.selectedSource.name;
      this.$.ga.addEvent(this.selectedSource.type, searchText);
      this.$.searchKeywordInput.selectedSuggestion = null;
    },

    _saveRecentSearch: function (recent) {
      if (!this.recent || !this.recent.searches) {
        this.recent = {searches: {}};
      }
      if (this.recent.searches.hasOwnProperty(this.selectedSource.type)) {
        var exists = this.recent.searches[this.selectedSource.type].filter(function (v) {
          return (v.name === recent.name);
        });

        if (!exists.length) {
          this.recent.searches[this.selectedSource.type].unshift(recent);
          if (this.recent.searches[this.selectedSource.type].length >= this.maxRecentSearches) {
            this.recent.searches[this.selectedSource.type].pop();
          }
        }

      } else {
        this.recent.searches[this.selectedSource.type] = [recent];
      }

      this.recent.lastSelectedFilter = this.selectedSourceIndex;
      this.$.localstorage.save();
    },

    _cleanSearchQuery: function (query) {
      // remove non-alphanumerical characters and multiple whitespaces
      return  query.replace( new RegExp( '[^a-zA-Z0-9 @]' , 'gi' ), " ").replace(new RegExp( "\\s+" , 'gi' ), " ").replace(/\s/g, '+');
    },

    _sourceSelected: function() {
      this.async(function () {

        if (this.selectedSource && !this.selectedSource.autoSuggest) {
          this.$.searchKeywordInput.suggestions = [];
        }

        this._keywordChanged();
        this.$.searchKeywordInput.setFocus();
      }, 100);
    },

    _keywordChanged: function(e) {
      var keyword = e && e.detail && e.detail.value ? e.detail.value : this.$.searchKeywordInput.keyword;

      if (!this.$.searchKeywordInput.selectedSuggestion && keyword.length > 2 && this.selectedSource.autoSuggest) {

        var that = this;

        if (that.$.jsonpQuery.loading)
          that.$.jsonpQuery.abortRequest();

        //new callback value to start a new call as user types
        that.$.jsonpQuery.callbackValue = 'foo' + keyword.length;
        that.$.jsonpQuery.url = that.selectedSource.api.url;

        keyword = that._cleanSearchQuery(keyword);

        if (typeof(that.selectedSource.api.params.prefix) != 'undefined')
          that.selectedSource.api.params.prefix = keyword;// encodeURIComponent(keyword);
        else if (typeof(that.selectedSource.api.params.q) != 'undefined')
          that.selectedSource.api.params.q = keyword;// encodeURIComponent(keyword);

        that.$.jsonpQuery.params = that.selectedSource.api.params;

        if (!that.$.jsonpQuery.loading)
          that.$.jsonpQuery.generateRequest();
      }
    },

    _suggestionsLoaded : function(e) {
      if (typeof(e.detail.response) !== 'undefined') {
        this.suggestions = this._processSuggestions(e.detail.response.docs);
      }
      else if (typeof(e.detail.result) !== 'undefined') {
        this.suggestions = this._processSuggestions(e.detail.result);
      }
      else {
        this.suggestions = this._processSuggestions(e.detail);
      }

      this.$.searchKeywordInput.suggestions = this.suggestions;
    },

    _suggestionsLoadingError : function(e) {
      console.log('_suggestionsLoadingError');
      console.log(e);
    },

    _processSuggestions: function (suggestions) {
      var processed = [];
      var api = this.selectedSource.api;
      var type = this.selectedSource.type;

      if (api.url === this.api.primoApi.url) {
        suggestions.forEach(function (s) {
          s.origName = s.text;
          s.name = s.text;
          s.type = type;
          processed.push(s);
        });
      }
      else if (api.url === this.api.summonApi.url) {
        suggestions.forEach(function (s) {
          s.origName = s.name;
          s.type = type;
          processed.push(s);
        });
      }
      else if (api.params.type === this.api.lrApi.params.type) {
        suggestions.forEach(function (s) {
          s.origName = s.name;
          s.type = type;
          s.name = s.name + ' (' + (s.course_title ? (s.course_title + ' | ') : '')  +
              (s.campus ? s.campus + ', ' : '') +
              (s.period ? s.period.toLowerCase() : '') +')';
          processed.push(s);
        });
      }
      else if (api.params.type === this.api.examsApi.params.type) {
        suggestions.forEach(function (s) {
          s.origName = s.name;
          s.type = type;
          s.name = s.name +' ('+ (s.course_title ? (s.course_title) : '') + ')';
          processed.push(s);
        });
      }
      else if (api.params.type === this.api.databaseApi.params.type) {
        suggestions.forEach(function (s) {
          s.origName = s.name;
          s.name = s.name + ' (' + (s.type == 'database' ? 'Database' : 'Subject Area')+')';
          s.type = type;
          processed.push(s);
        });
      }

      var result = this._recentSuggestions();
      processed.forEach(function (p) {
        var exists = result.filter(function (v) {
          return (v.name === p.name);
        });
        if (! exists.length) {
          result.push(p);
        }
      });

      return result;
    },

    _recentSuggestions: function () {
      var recent = [];
      var keyword = this.$.searchKeywordInput.keyword;

      if (this.recent && this.recent.searches && this.recent.searches.hasOwnProperty(this.selectedSource.type)) {
        recent = this.recent.searches[this.selectedSource.type].filter(function (v) {
          return (v.name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1);
        });
      }
      return recent.sort(function (a, b) {
        return a.name.length - b.name.length;
      }).slice(0, this.maxRecentSuggestions);
    },

    _localStorageLoaded: function() {
      if (!this.recent || !this.recent.searches) {
        this.recent = {searches: {}};
      }

      if (this.recent && this.recent.lastSelectedFilter) {
        this.selectedSourceIndex = this.recent.lastSelectedFilter;
      }
    },

    _closeSources : function(e) {
      this.$.menuSources.close();
    },

    _keywordFocused: function() {
      if (this.$.menuSources.opened){
        this.$.menuSources.close();
      }
      else {
        this.$.menuSources.open();
      }
    },

    ready: function() {
      var self = this;
      var defaultHelpLinks = [
        {
          title: 'Search help',
          url: 'https://web.library.uq.edu.au/research-tools-techniques/search-techniques/searching-uq-library'
        },
        {
          title: 'Advanced search',
          url: 'http://uq.summon.serialssolutions.com/#!/advanced'
        }
      ];

      //TODO: primo urlAppend should be updated to point to real search....
      this.sources = [
        { name: 'Primo',
          type: 'all',
          url: this.links.primo,
          urlAppend: '&fn=search&ct=search&initialSearch=true&mode=Basic&tab=61uq_all&indx=1&dum=true&srt=rank&vid=61UQ&frbg=&tb=t&vl%28freeText0%29=china&scp.scps=scope%3A%2861UQ_eSpace%29%2Cscope%3A%2861UQ_FEZ_130846%29%2Cscope%3A%2861UQ_FEZ_13197%29%2Cscope%3A%2861UQ_FEZ_13199%29%2Cscope%3A%2861UQ_FEZ_152799%29%2Cscope%3A%2861UQ_FEZ_155729%29%2Cscope%3A%2861UQ_FEZ_151710%29%2Cscope%3A%2861UQ_FEZ_179407%29%2Cscope%3A%2861UQ_FEZ_209864%29%2Cscope%3A%2861UQ_FEZ_219034%29%2Cscope%3A%28%2261UQ_ALMA%22%29%2Cscope%3A%2861UQ%29%2Cscope%3A%2861UQ_FEZ_216496%29%2Cscope%3A%2861UQ_FEZ_183974%29%2Cscope%3A%2861UQ_FEZ_216495%29%2Cprimo_central_multiple_fe&vl%281UIStartWith0%29=contains&vl%28D75285834UI0%29=any&vl%28D75285834UI0%29=title&vl%28D75285834UI0%29=any',
          autoSuggest: true,
          api: this.api.primoApi,
          icon: 'social:public',
          inputPlaceholder: 'Test primo search....',
          helpLinks: defaultHelpLinks
        },
        { name: 'Library',
          type: 'all',
          url: this.links.summon,
          urlAppend: '&fvf=ContentType,Newspaper%20Article,t%7CContentType,Book%20Review,t',
          autoSuggest: true,
          api: this.api.summonApi,
          icon: 'social:public',
          inputPlaceholder: 'Find books, articles, databases, conferences and more',
          helpLinks: defaultHelpLinks
        },
        { name: 'Books',
          type: 'books',
          url: this.links.summon,
          urlAppend: '&fvf=ContentType,Book%20%2F%20eBook,f%7CContentType,Newspaper%20Article,t%7CContentType,Book%20Review,t%7CContentType,Book%20Chapter,f',
          autoSuggest: true,
          api: this.api.summonApi,
          icon: 'communication:import-contacts',
          inputPlaceholder: 'Enter a keyword, title, author, etc',
          helpLinks: defaultHelpLinks
        },
        { name: 'Journal articles',
          type: 'journal_articles',
          url: this.links.summon,
          urlAppend: '&fvf=ContentType,Newspaper%20Article,t%7CContentType,Book%20Review,t%7CContentType,Journal%20Article,f%7CContentType,Magazine%20Article,f',
          autoSuggest: true,
          api: this.api.summonApi,
          icon: 'social:school',
          inputPlaceholder: 'Enter a keyword, article title, author, publication, etc',
          helpLinks: defaultHelpLinks
        },
        { name: 'Video & audio',
          type: 'multimedia',
          url: this.links.summon,
          urlAppend: '&fvf=ContentType,Audio%20Recording,f%7CContentType,Streaming%20Video,f%7CContentType,Streaming%20Audio,f%7CContentType,Video%20Recording,f%7CContentType,Music%20Recording,f%7CContentType,Spoken%20Word%20Recording,f',
          autoSuggest: true,
          api: this.api.summonApi,
          icon: 'icons:theaters',
          inputPlaceholder: 'Enter a keyword, title, cast, crew, composer, artist, etc',
          helpLinks: defaultHelpLinks
        },
        { name: 'Journals',
          type: 'journals',
          url: this.links.journals,
          autoSuggest: true,
          api: this.api.summonApi,
          icon: 'editor:insert-drive-file',
          inputPlaceholder: 'Enter journal or newspaper title',
          helpLinks: [ { title: 'Browse journals', url: 'https://app.library.uq.edu.au/#/journals' } ]
        },
        { name: 'Databases',
          type: 'databases',
          url: this.links.database,
          autoSuggest: true,
          api: this.api.databaseApi,
          icon: 'editor:format-align-justify',
          inputPlaceholder: 'Enter a keyword or database name',
          helpLinks: [
            { title: 'Database help', url: 'https://web.library.uq.edu.au/research-tools-techniques/search-techniques/searching-databases' },
            { title: 'Browse databases', url: 'https://app.library.uq.edu.au/#/gateways/database' }
          ]
        },
        { name: 'Catalogue',
          type: 'catalogue',
          url: this.links.catalogue,
          autoSuggest: false,
          icon: 'icons:inbox',
          inputPlaceholder: 'Enter a keyword, title, author, etc',
          helpLinks: [{title: 'Advanced catalogue search', url: 'https://library.uq.edu.au/search~S7/X'}]
        },
        { name: 'Past exam papers',
          type: 'exam_papers',
          url: this.links.exams,
          autoSuggest: true,
          api: this.api.examsApi,
          icon: 'icons:assessment',
          inputPlaceholder: 'Enter a course code',
          helpLinks: [{title: 'Browse courses', url: 'https://www.library.uq.edu.au/exams/search.html'}]
        },
        { name: 'Course reading lists',
          type: 'learning_resources',
          url: this.links.lr,
          autoSuggest: true,
          api: this.api.lrApi,
          icon: 'icons:list',
          inputPlaceholder: 'Enter a course code',
          helpLinks: [{title: 'Browse courses', url: 'http://lr.library.uq.edu.au/index.html?browse'}]
        }
      ];
      this.selectedSource = this.sources[this.selectedSourceIndex];

      this.async(function () {
        this.$.searchKeywordInput.setFocus();
      }, 100);
    }

  });
})();