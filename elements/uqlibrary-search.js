(function () {
  Polymer({
    is: 'uqlibrary-search',
    properties: {
      api : {
          type: Object,
          value: {
              summonApi: 'https://d3nm82zk9ronst.cloudfront.net/metadata/suggest/suggest',
              lrApi: 'https://app.library.uq.edu.au/api/search_suggestions?type=learning_resource',
              examsApi: 'https://app.library.uq.edu.au/api/search_suggestions?type=exam_paper',
              databaseApi: 'https://app.library.uq.edu.au/api/search_suggestions?type=database'
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
      }
    },

    _selectedSourceIndexChanged: function(newValue, oldValue) {
      if (this.sources) {
        this.selectedSource = this.sources[newValue];
      }
    },

    _searchActivated: function(e) {
      //this.$.ga.addEvent('Search performed');

      console.log('looking ...');
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
                api: this.api.database,
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
    },

  });
})();