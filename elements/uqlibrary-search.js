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
              },
              databaseApi: {
                params: {
                  type: 'database',
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
          primo: 'http://search.library.uq.edu.au/primo_library/libweb/action/search.do?vl(freeText0)=',
          exams: 'https://www.library.uq.edu.au/exams/papers.php?stub=',
          lr: 'http://lr.library.uq.edu.au/search?q=',
          database: 'https://www.library.uq.edu.au/resources/database/#/?title='
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
        else if (this.selectedSource.type === 'physical_items') {
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
        this.$.ajax.type = this.selectedSource.api.params.type;
        this.$.ajax.get(encodeURIComponent(this._cleanSearchQuery(keyword)));
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
      else if (api.params.type === this.api.databaseApi.params.type) {
        suggestions.forEach(function (s) {
          s.origName = s.name;
          s.name = s.name + ' (' + (s.type == 'database' ? 'Database' : 'Subject Area') +')';
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
          title: 'Browse search',
          url: 'http://search.library.uq.edu.au/primo_library/libweb/action/search.do?fn=showBrowse&mode=BrowseSearch&vid=61UQ'
        },
        {
          title: 'Advanced search',
          url: 'http://search.library.uq.edu.au/primo_library/libweb/action/search.do?mode=Advanced&ct=AdvancedSearch&vid=61UQ'
        }
      ];

      this.sources = [
        { name: 'Library',
          type: 'all',
          url: this.links.primo,
          urlAppend: '&ct=facet&rfnGrpCounter=1&frbg=&&indx=1&fn=search&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&fctExcV=newspaper_articles&mulExcFctN=facet_rtype&rfnExcGrp=1&fctExcV=reviews&mulExcFctN=facet_rtype&rfnExcGrp=1',
          autoSuggest: true,
          api: this.api.primoApiAll,
          icon: 'social:public',
          inputPlaceholder: 'Find books, articles, databases, conferences and more',
          helpLinks: defaultHelpLinks
        },
        { name: 'Books',
          type: 'books',
          url: this.links.primo,
          urlAppend: '&fn=search&ct=facet&fctN=facet_rtype&fctV=books&rfnGrp=1&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&dum=true',
          autoSuggest: true,
          api: this.api.primoApiLocal,
          icon: 'communication:import-contacts',
          inputPlaceholder: 'Enter a keyword, title, author, etc',
          helpLinks: defaultHelpLinks
        },
        { name: 'Journal articles',
          type: 'journal_articles',
          url: this.links.primo,
          urlAppend: '&fn=search&ct=facet&fctN=facet_rtype&fctV=articles&rfnGrp=1&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&dum=true',
          autoSuggest: true,
          api: this.api.primoApiAll,
          icon: 'social:school',
          inputPlaceholder: 'Enter a keyword, article title, author, publication, etc',
          helpLinks: defaultHelpLinks
        },
        { name: 'Video & audio',
          type: 'multimedia',
          url: this.links.primo,
          urlAppend: '&fn=search&ct=facet&fctN=facet_rtype&fctV=media&rfnGrp=1&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&dum=true',
          autoSuggest: true,
          api: this.api.primoApiAll,
          icon: 'icons:theaters',
          inputPlaceholder: 'Enter a keyword, title, cast, crew, composer, artist, etc',
          helpLinks: defaultHelpLinks
        },
        { name: 'Journals',
          type: 'journals',
          url: this.links.primo,
          urlAppend: '&fn=search&vl(1UIStartWith0)=contains&ct=search&srt=rank&begins_with1=1&vl(D75285834UI0)=title&vid=61UQ&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&tb=t&mode=Basic&tab=61uq_all&dum=true&fctIncV=journals&mulIncFctN=facet_rtype&rfnIncGrp=1',
          autoSuggest: true,
          api: this.api.primoApiLocal,
          icon: 'editor:insert-drive-file',
          inputPlaceholder: 'Enter journal or newspaper title',
          helpLinks: defaultHelpLinks
        },
        { name: 'Physical items',
          type: 'physical_items',
          url: this.links.primo,
          urlAppend: '&fn=search&vid=61UQ&rfnId=rfin9&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&mulIncFctN=facet_library&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&rfnIncGrp=1&fctIncV=61UQ_BDMB&fctIncV=61UQ_HERON&fctIncV=61UQ_BDMS&fctIncV=61UQ_JKMRC&fctIncV=61UQ_STR&fctIncV=61UQ_ROC&fctIncV=61UQ_HVY&fctIncV=61UQ_BND&fctIncV=61UQ_TBA&fctIncV=61UQ_ONLINE&fctIncV=61UQ_PACE&fctIncV=61UQ_MATER&fctIncV=61UQ_GATTON&fctIncV=61UQ_HERSTON&fctIncV=61UQ_FRY&fctIncV=61UQ_ARMUS&fctIncV=61UQ_ESL&fctIncV=61UQ_WHS&fctIncV=61UQ_SSH',
          autoSuggest: true,
          api: this.api.primoApiLocal,
          icon: 'icons:inbox',
          inputPlaceholder: 'Enter a keyword, title, author, etc',
          helpLinks: defaultHelpLinks
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