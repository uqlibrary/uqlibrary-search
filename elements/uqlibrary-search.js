(function () {
  Polymer({
    is: 'uqlibrary-search',
    properties: {
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
      sources: {
        type: Array
      },
      suggestions: {
        type: Array,
        value: function() {
          return [];
        }
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
      selectedSourceApi: { type: String },
      keyword: {
        type: String,
        observer: '_keywordChanged'
      },
      maxRecentSuggestions: {
        type: Number,
        value: 2
      },
      maxRecentSearches: {
        type: Number,
        value: 10
      },
      inputKeywordTarget: {
        type: Object,
        value: function() {
          return this.$.inputKeyword;
        }
      }
    },

    _selectedSourceIndexChanged: function(newValue, oldValue) {
      if (this.sources) {
        this.selectedSource = this.sources[newValue];
      }
    },

    _searchActivated: function(e) {
      //TODO: record GA event: search
      //this.$.ga.addEvent('Search performed');

      console.log('_searchActivated: looking ...');
    },

    _sourceSelected: function(e) {
      if (this.selectedSource && !this.selectedSource.autoSuggest)
        this.suggestions = [];

      this._keywordChanged();
      this.$.inputKeyword.focus();
    },

    _keywordChanged: function(newValue, oldValue) {
      if (this.keyword.length > 2 && this.selectedSource.autoSuggest) {

        this.$.jsonpQuery.url = this.selectedSource.api.url;
        this.selectedSource.api.params.prefix = encodeURIComponent(this.keyword);
        this.$.jsonpQuery.params = this.selectedSource.api.params;

        if(!this.$.jsonpQuery.loading)
          this.$.jsonpQuery.generateRequest();
      }
    },

    _suggestionsLoaded : function(e) {
      this.suggestions = this._processSuggestions(e.detail.result ? e.detail.result : e.detail);
      this._openSuggestions(e);
    },

    _suggestionsLoadingError : function(e) {
      console.log(e);
    },

    _suggestionSelected: function (e) {
      this.async(function () {
        this.keyword = this.$.listSuggestions.selectedItem.getAttribute('data-value');
        this.$.menuSuggestions.close();

        //TODO: record GA event: search from auto suggestion
        //this.$.inputKeyword.value = e.detail.item.getAttribute('data-value');

        this._searchActivated();
      }, 100);
    },

    _focusSuggestions: function (e) {
      this.async(function () {
        if (this.$.menuSuggestions.opened) {
          this.$.listSuggestions.focus();
        }
      }, 100);
    },

    _openSuggestions: function (e) {
      this.async(function () {
        if (this.selectedSource.autoSuggest && this.suggestions && this.suggestions.length > 0)
          this.$.menuSuggestions.open();
      }, 100);
    },

    _closeSuggestions: function (e) {
      this.async(function () {
        if (!this.$.listSuggestions.focusedItem)
          this.$.menuSuggestions.close();
      }, 100);
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
          s.name = s.name + ' (' + (s.course_title ? (s.course_title + '|') : '')  +
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
          s.type = type;
          s.name = s.name + ' (' + (s.type == 'database' ? 'Database' : 'Subject Area')+')';
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
      var that = this;
      if (this.recent && this.recent.searches && this.recent.searches.hasOwnProperty(this.selectedFilter)) {
        recent = this.recent.searches[this.selectedFilter].filter(function (v) {
          return (v.name.toLowerCase().indexOf(that.searchText.toLowerCase()) !== -1);
        });
      }
      return recent.sort(function (a, b) {
        return a.name.length - b.name.length;
      }).slice(0, this.maxRecentSuggestions);
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
          url: this.journals,
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
          url: this.lr, autoSuggest: true,
          api: this.api.lrApi,
          icon: 'icons:list',
          inputPlaceholder: 'Enter a course code',
          helpLinks: [{title: 'Browse courses', url: 'http://lr.library.uq.edu.au/index.html?browse'}]
        }
      ];
      this.selectedSource = this.sources[this.selectedSourceIndex];

      this.$.menuSuggestions.positionTarget = this.$.inputKeyword;

    }

  });
})();