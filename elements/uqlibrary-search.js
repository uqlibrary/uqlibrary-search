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
          primoApiAll: {
            params: {
              type : 'primoAll',
              prefix: ''
            }
          },
          primoApiLocal: {
            params: {
              type : 'primoLocal',
              prefix: ''
            }
          },
          lrApi: {
            params: {
              type : 'learning_resource',
              prefix: ''
            }
          },
          examsApi: {
            params: {
              type : 'exam_paper',
              prefix: ''
            }
          }
        }
      },

      /**
       * Redirections list after search is performed
       */
      links : {
        type: Object,
        value: {
          primo: 'https://search.library.uq.edu.au/primo-explore/search?query=',
          exams: 'https://www.library.uq.edu.au/exams/papers.php?stub=',
          lr: 'http://lr.library.uq.edu.au/search?q=',
          database: 'https://search.library.uq.edu.au/primo-explore/dbsearch?query=any,contains,%%&tab=jsearch_slot&vid=61UQ&offset=0&databases=any,%%'
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
        (this.selectedSource.type === 'learning_resources')) {
        searchUrl = selectedSuggestion.url;
      }

      if (!searchUrl) {
        if (this.selectedSource.type === 'learning_resources' || this.selectedSource.type === 'exam_papers') {
          var s = searchText.split(" ");
          searchText = s[0];
        }

        if (this.selectedSource.type === 'databases') {
          searchUrl = encodeURI(
            this.selectedSource.url.replace(/%%/g, searchText)
          );
        } else {
          searchUrl = encodeURI(this.selectedSource.url) +
            (this.selectedSource.hasOwnProperty('urlPrepend') ?  this.selectedSource.urlPrepend : '') +
            encodeURIComponent(searchText);
  
          if (this.selectedSource.urlAppend) {
            searchUrl += this.selectedSource.urlAppend;
          }
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

      this.recent.dateSaved = this._now();

      this.$.localstorage.save();
    },

    _now: function() {
      var d = new Date();
      var now = d.getTime();
      return now;
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
        this.$.ajax.type = this.selectedSource.api.params.type;
        this.$.ajax.get(encodeURIComponent(keyword));
      }
    },

    _suggestionsLoaded : function(e) {
      this.suggestions = this._processSuggestions(e.detail);
      this.$.searchKeywordInput.suggestions = this.suggestions;
    },

    _processSuggestions: function (suggestions) {
      var processed = [];
      var api = this.selectedSource.api;
      var type = this.selectedSource.type;

      if (api.params.type === this.api.primoApiAll.params.type
        || api.params.type === this.api.primoApiLocal.params.type) {
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

      // we only reuse the dropdown filter selection from searches less than 1 hour ago
      var oneHour = 60 * 60 * 1000;

      if (this.recent && this.recent.hasOwnProperty('lastSelectedFilter')
        && this._now() < this.recent.dateSaved + oneHour){
        this.configuration = this.recent.configurationUsed;
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
          url: 'https://web.library.uq.edu.au/research-tools-techniques/uq-library-search'
        },
        {
          title: 'Browse search',
          url: 'https://search.library.uq.edu.au/primo-explore/browse?vid=61UQ&sortby=rank',
        },

        {
          title: 'Advanced search',
          url: 'https://search.library.uq.edu.au/primo-explore/search?vid=61UQ&sortby=rank&mode=advanced'
        }
      ];

      this.sources = [
        { name: 'Library',
          type: 'all',
          url: this.links.primo,
          urlPrepend: 'any,contains,',
          urlAppend: '&tab=61uq_all&search_scope=61UQ_All&sortby=rank&vid=61UQ&offset=0&facet=rtype,exclude,newspaper_articles,lk&facet=rtype,exclude,reviews,lk',
          autoSuggest: true,
          api: this.properties.api.value.primoApiAll,
          icon: 'social:public',
          inputPlaceholder: 'Find books, articles, databases, conferences and more',
          helpLinks: defaultHelpLinks
        },
        { name: 'Books',
          type: 'books',
          url: this.links.primo,
          urlPrepend: 'any,contains,',
          urlAppend: '&tab=61uq_all&search_scope=61UQ_All&sortby=rank&vid=61UQ&offset=0&facet=rtype,include,books',
          autoSuggest: true,
          api: this.properties.api.value.primoApiLocal,
          icon: 'communication:import-contacts',
          inputPlaceholder: 'Enter a keyword, title, author, etc',
          helpLinks: defaultHelpLinks
        },
        { name: 'Journal articles',
          type: 'journal_articles',
          url: this.links.primo,
          urlPrepend: 'any,contains,',
          urlAppend: '&tab=61uq_all&search_scope=61UQ_All&vid=61UQ&offset=0&fctV=articles&facet=rtype,include,articles',
          autoSuggest: true,
          api: this.properties.api.value.primoApiAll,
          icon: 'social:school',
          inputPlaceholder: 'Enter a keyword, article title, author, publication, etc',
          helpLinks: defaultHelpLinks
        },
        { name: 'Video & audio',
          type: 'multimedia',
          url: this.links.primo,
          urlPrepend: 'any,contains,',
          urlAppend: '&tab=61uq_all&search_scope=61UQ_All&sortby=rank&vid=61UQ&facet=rtype,include,videos&facet=rtype,include,audios&offset=0',
          autoSuggest: true,
          api: this.properties.api.value.primoApiAll,
          icon: 'icons:theaters',
          inputPlaceholder: 'Enter a keyword, title, cast, crew, composer, artist, etc',
          helpLinks: defaultHelpLinks
        },
        { name: 'Journals',
          type: 'journals',
          url: this.links.primo,
          urlPrepend: 'title,contains,',
          urlAppend: ',AND&tab=61uq_all&search_scope=61UQ_All&sortby=rank&vid=61UQ&mfacet=rtype,include,newspapers,1&mfacet=rtype,include,journals,1&mode=simple&offset=0',
          autoSuggest: true,
          api: this.properties.api.value.primoApiLocal,
          icon: 'editor:insert-drive-file',
          inputPlaceholder: 'Enter journal or newspaper title',
          helpLinks: defaultHelpLinks
        },
        { name: 'Physical items',
          type: 'physical_items',
          url: this.links.primo,
          urlPrepend: 'any,contains,',
          urlAppend: '&tab=61uq_all&search_scope=61UQ_All&vid=61UQ&offset=0&facet=tlevel,include,physical_items',
          autoSuggest: true,
          api: this.properties.api.value.primoApiLocal,
          icon: 'icons:inbox',
          inputPlaceholder: 'Enter a keyword, title, author, etc',
          helpLinks: defaultHelpLinks
        },
        { name: 'Databases',
          type: 'databases',
          url: this.links.database,
          autoSuggest: false,
          api: null,
          icon: 'editor:format-align-justify',
          inputPlaceholder: 'Enter database title',
          helpLinks: [
            { title: 'Database help', url: 'https://web.library.uq.edu.au/research-tools-techniques/search-techniques/searching-databases' },
            { title: 'Browse databases', url: 'https://search.library.uq.edu.au/primo-explore/dbsearch?vid=61UQ' }
          ]
        },
        { name: 'Past exam papers',
          type: 'exam_papers',
          url: this.links.exams,
          autoSuggest: true,
          api: this.properties.api.value.examsApi,
          icon: 'icons:assessment',
          inputPlaceholder: 'Enter a course code',
          helpLinks: [{title: 'Browse courses', url: 'https://www.library.uq.edu.au/exams/search.html'}]
        },
        { name: 'Course reading lists',
          type: 'learning_resources',
          url: this.links.lr,
          autoSuggest: true,
          api: this.properties.api.value.lrApi,
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
