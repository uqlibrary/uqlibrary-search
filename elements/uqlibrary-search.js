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

      selectedSourceIndex: {
        type: Number,
        value: 0,
        observer: '_selectedSourceIndexChanged'
      },

      selectedSource: {
        type: Object,
        notify: true
      },

      selectedSourceApi: {
        type: String
      },

      maxRecentSuggestions: {
        type: Number,
        value: 2
      },

      maxRecentSearches: {
        type: Number,
        value: 10
      },

      recent: {
        type: Object
      }
    },

    _selectedSourceIndexChanged: function(newValue, oldValue) {
      if (this.sources) {
        this.selectedSource = this.sources[newValue];
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
        searchUrl = this.selectedSource.url + encodeURIComponent(searchText);
        if (this.selectedSource.urlAppend) {
          searchUrl += this.selectedSource.urlAppend;
        }
      } else {
        recent.url = searchUrl;
      }

      if (selectedSuggestion) {
        this._saveRecentSearch(recent);
      }

      console.log(searchUrl);

      this.async(function () {
        document.location.href = searchUrl;
      }, 100);

      this.$.ga.addEvent(this.selectedSource.type, searchText);
    },

    _saveRecentSearch: function (recent) {
      if (!this.recent || !this.recent.searches) {
        this.recent = {searches: {}};
      }
      if (
          this.recent.searches.hasOwnProperty(this.selectedSource.type)
      ) {
        var exists = this.recent.searches[this.selectedSource.type].filter(function (v) {
          return (v.name === recent.name);
        });
        if (! exists.length) {
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

    _sourceSelected: function(e) {
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

      if (keyword.length > 2 && this.selectedSource.autoSuggest) {

        this.$.jsonpQuery.url = this.selectedSource.api.url;

        keyword = this._cleanSearchQuery(keyword);
        this.selectedSource.api.params.prefix = keyword;// encodeURIComponent(keyword);
        this.$.jsonpQuery.params = this.selectedSource.api.params;

        if(!this.$.jsonpQuery.loading)
          this.$.jsonpQuery.generateRequest();
      }
    },

    _suggestionsLoaded : function(e) {
      this.suggestions = this._processSuggestions(e.detail.result ? e.detail.result : e.detail);
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

      if (api.url === this.api.summonApi.url) {
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

    _recentSearchClass: function(isRecent) {
      return isRecent ? 'recent-search' : '';
    },

    ready: function() {
      var self = this;
      var defaultHelpLinks = [
        {
          title: 'Search help',
          url: 'https://www.library.uq.edu.au/search'
        },
        {
          title: 'Advanced search',
          url: 'http://uq.summon.serialssolutions.com/#!/advanced'
        }
      ];

      this.sources = [
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
        { name: 'Multimedia',
          type: 'multimedia',
          url: this.links.summon,
          urlAppend: '&fvf=ContentType,Newspaper%20Article,t%7CContentType,Book%20Review,t%7CContentType,Audio%20Recording,f%7CContentType,Spoken%20Word%20Recording,f%7CContentType,Video%20Recording,f%7CContentType,Streaming%20Video,f%7CContentType,Slide,f%7CContentType,Photograph,f%7CContentType,Music%20Recording,f%7CContentType,Music%20Score,f%7CContentType,Painting,f%7CContentType,Sheet%20Music,f%7CContentType,Poster,f%7CContentType,Art,f%7CContentType,Compact%20Disc,f%7CContentType,Drawing,f%7CContentType,Graphic%20Arts,f%7CContentType,Image,f%7CContentType,Kit,f',
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
            { title: 'Database help', url: 'https://www.library.uq.edu.au/v/6559' },
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