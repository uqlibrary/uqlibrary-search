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
            api: {
                type: Object,
                value: {
                    primoApiAll: {
                        params: {
                            type: 'primoAll',
                            prefix: ''
                        }
                    },
                    primoApiLocal: {
                        params: {
                            type: 'primoLocal',
                            prefix: ''
                        }
                    },
                    lrApi: {
                        params: {
                            type: 'learning_resource',
                            prefix: ''
                        }
                    },
                    examsApi: {
                        params: {
                            type: 'exam_paper',
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
             * Beta of new primo - set up the old and new urls to be swapped in and out as the tabs change
             */
            urls: {
              type: Object,
              value: {
                all: {
                  old: {
                    urlAppend: '&ct=facet&rfnGrpCounter=1&frbg=&&indx=1&fn=search&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&fctExcV=newspaper_articles&mulExcFctN=facet_rtype&rfnExcGrp=1&fctExcV=reviews&mulExcFctN=facet_rtype&rfnExcGrp=1',
                  },
                  new: {
                    urlAppend: '&tab=61uq_all&search_scope=61UQ_All&sortby=rank&vid=61UQ_DEV&offset=0'
                  }
                },
                books: {
                  old: {
                    urlAppend: '&fn=search&ct=facet&fctN=facet_rtype&fctV=books&rfnGrp=1&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&dum=true',
                  },
                  new: {
                    urlAppend: '&tab=61uq_all&search_scope=61UQ_All&sortby=rank&vid=61UQ_DEV&offset=0&facet=rtype,include,books'
                  }
                },
                multimedia: {
                  old: {
                    urlAppend: '&fn=search&ct=facet&fctN=facet_rtype&fctV=media&rfnGrp=1&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&dum=true',
                  },
                  new: {
                    urlAppend: '&tab=61uq_all&search_scope=61UQ_All&sortby=rank&vid=61UQ_DEV&offset=0&facet=rtype,include,media'
                  }
                },
                journal_articles: {
                  old: {
                    urlAppend: '&fn=search&ct=facet&fctN=facet_rtype&fctV=articles&rfnGrp=1&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&dum=true',
                  },
                  new: {
                    urlAppend: '&tab=61uq_all&search_scope=61UQ_All&vid=61UQ_DEV&offset=0&fctV=articles&facet=rtype,include,articles'
                  }
                },
                journals: {
                  old: {
                    urlAppend: '&fn=search&vl(1UIStartWith0)=contains&ct=search&srt=rank&begins_with1=1&vl(D75285834UI0)=title&vid=61UQ&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&tb=t&mode=Basic&tab=61uq_all&dum=true&fctIncV=journals&mulIncFctN=facet_rtype&rfnIncGrp=1',
                  },
                  new: {
                    url: 'https://search.library.uq.edu.au/primo-explore/search?query=title,contains,',
                    urlAppend: ',AND&pfilter=pfilter,exact,journals,AND&tab=61uq_all&search_scope=61UQ_All&sortby=rank&vid=61UQ_DEV&mode=advanced&offset=0'
                  }
                },
                physical_items: {
                  old: {
                    urlAppend: '&ct=facet&fctN=facet_tlevel&fctV=physical_items&rfnGrp=show_only&frbg=&&indx=1&fn=search&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&dum=true',
                  },
                  new: {
                    urlAppend: '&tab=61uq_all&search_scope=61UQ_All&sortby=title&vid=61UQ_DEV&offset=0&facet=tlevel,include,physical_items'
                  }
                }
              }
            },

            /**
             * Redirections list after search is performed
             */
            links: {
                type: Object,
                value: {
                    primo: 'http://search.library.uq.edu.au/primo_library/libweb/action/search.do?vl(freeText0)=',
                    newPrimo: 'https://search.library.uq.edu.au/primo-explore/search?query=any,contains,',
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

        _selectedSourceIndexChanged: function (newValue, oldValue) {
          if (this.sources) {
            this.selectedSource = this.sources[newValue];
            this.$.menuSources.close();
            this._sourceSelected();
          }
        },

        /**
         * Beta of new primo - show and hide the tabs
         * chosen tab - beta the new primo (value = 1) or use the current primo (value = 0)
         * defaults to cookie value, or current primo if no cookie
         * @param event
         */
        onTabSelect: function (event) {
          // check if tab with new version is clicked
          var isNew = event.detail.item.id == 'newPrimo';
          this._toggleBetaDisplayItems(isNew);

          // set cookie
          this._setCookie('LibrarySearchChoice', event.detail.item.id);
        },

        _toggleBetaDisplayItems: function(isNew) {
          // toggle tag line
          this._toggleTagLine(isNew);

          // toggle input fields color
          this._toggleInputColor(isNew);

          // toggle primo urls for sources
          this._togglePrimoUrl(isNew);

          // change the search buttons
          this._toggleSearchButtons(isNew);

          // focus input
          this.$.searchKeywordInput.setFocus();
        },

        /**
         * Beta of new primo - show and hide the tab tag line
         * @param isNew
         * @private
         */
        _toggleTagLine: function(isNew) {
            var newPrimoTagLine = document.getElementById('newPrimoTagLine');
            if (newPrimoTagLine) {
              newPrimoTagLine.style.display = isNew ? 'block' : 'none';
            } else {
              console.log('newPrimoTagLine not found');
            }
          },

        /**
         * Beta of new primo - change the landing url for each dropdown type
         * @param isNew
         * @private
         */
        _togglePrimoUrl: function(isNew) {
          var url = isNew ? this.links.newPrimo : this.links.primo;
          this._changePrimoUrl(url, isNew);
        },

        /**
         * Change Primo Url
         * @param url
         * @param isNew
         * @private
         */
        _changePrimoUrl: function(url, isNew) {
          var newPrimoSources = ['all', 'books', 'journal_articles', 'multimedia', 'journals', 'physical_items'];

          this.sources.forEach(function (source) {
            if (newPrimoSources.indexOf(source.type) > -1) {
              // update url
              if (isNew) {
                if (typeof this.urls[source.type].new.url === 'string') { // if we supply a specific one, use it
                  source.url = this.urls[source.type].new.url;
                } else {                                                  // otherwise use the default new Primo one
                  source.url = this.links.newPrimo;
                }
              } else {
                source.url = this.links.primo;
              }

              // update urlappend
              source.urlAppend = isNew ? this.urls[source.type].new.urlAppend : this.urls[source.type].old.urlAppend;
            }
          }.bind(this));
        },

        /**
         * Beta of new primo - show hide the Browse Search button (there isnt a browse page for new primo)
         * & change the Advanced Search landing url
         * @param isNew
         * @private
         */
        _toggleSearchButtons: function(isNew) {
          // because this is temporary code, we are hard coding the index arrays - should only last a month
           var indexBrowseSearch = 1; // position of 'Browse Search' button in the array
           var indexAdvancedSearch = 2; // position of 'Advanced Search' button in the array

          var advancedSearchButtonUrl = {
            old: 'http://search.library.uq.edu.au/primo_library/libweb/action/search.do?mode=Advanced&ct=AdvancedSearch&vid=61UQ',
            new: 'https://search.library.uq.edu.au/primo-explore/search?vid=61UQ_DEV'
          };

          if (isNew) {
            // change Advanced Search link to new link
            if (typeof this.selectedSource.helpLinks[indexAdvancedSearch] !== 'undefined'
              && 'Advanced search' == this.selectedSource.helpLinks[indexAdvancedSearch].title) {
              this.notifyPath('selectedSource.helpLinks.' + indexAdvancedSearch + '.url', advancedSearchButtonUrl.new);
            }
            if (typeof this.selectedSource.helpLinks[indexBrowseSearch] !== 'undefined'
              && 'Browse search' == this.selectedSource.helpLinks[indexBrowseSearch].title) {
              this.notifyPath('selectedSource.helpLinks.' + indexBrowseSearch + '.enabled', false);
            }

          } else {
            // change Advanced Search link to new link
            if (typeof this.selectedSource.helpLinks[indexAdvancedSearch] !== 'undefined'
              && 'Advanced search' == this.selectedSource.helpLinks[indexAdvancedSearch].title) {
              this.notifyPath('selectedSource.helpLinks.' + indexAdvancedSearch + '.url', advancedSearchButtonUrl.old);
            }
            if (typeof this.selectedSource.helpLinks[indexBrowseSearch] !== 'undefined'
              && 'Browse search' == this.selectedSource.helpLinks[indexBrowseSearch].title) {
              this.notifyPath('selectedSource.helpLinks.' + indexBrowseSearch + '.enabled', true);
            }

          }

        },

        /**
         * Beta of new primo - change the background color of the input fields to blue for the beta tab
         * @param isNew
         * @private
         */
        _toggleInputColor: function(isNew) {
          var color = isNew ? '#d7e2ef' : '#f2f2f2';
          this._betaAddHighlighting(color);
        },

        /**
         * Beta of new primo - highlight the fields when using new primo
         * @param inputBackgroundColor
         * @private
         */
          _betaAddHighlighting: function (inputBackgroundColor) {

              // update display inputBackgroundColor
              var htmlElement = document.getElementById('inputSources');
              if (htmlElement) htmlElement.style.backgroundColor = inputBackgroundColor;

              htmlElement = document.getElementById('searchKeywordInput');
              if (htmlElement) htmlElement.style.backgroundColor = inputBackgroundColor;

              var listSource = document.getElementById('listSources');
              if (listSource) listSource.style.backgroundColor = inputBackgroundColor;
        },

        /**
         * Beta of new primo - Set cookie
         * @param cname
         * @param cvalue
         * @param exdays
         * @private
         */
        // if the beta test tabs were going to be used for longer it should be converted to be saved with the this.recent, same as the last-used search
        // but we didnt notice in time, so will leave as this is a temporary fix
        _setCookie: function (cname, cvalue, exdays) {
          exdays = exdays || 25; // new primo goes live in a few weeks, so 25 days is enough
          var d = new Date();
          d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
          var expires = "expires=" + d.toUTCString();
          document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        },

        /**
         * Beta of new primo - Get cookie
         * @param cname
         * @returns {*}
         * @private
         */
        _getCookie: function (cname) {
          var name = cname + "=";
          var ca = document.cookie.split(';');
          for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
              c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
            }
          }
          return "";
        },

        _searchActivated: function (e) {
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
              searchUrl = encodeURI(this.selectedSource.url) +  encodeURIComponent(searchText);
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

            this.recent.dateSaved = this._now();

            this.$.localstorage.save();
        },

        _now: function () {
            var d = new Date();
            var now = d.getTime();
            return now;
        },

        _sourceSelected: function () {
            this.async(function () {

                if (this.selectedSource && !this.selectedSource.autoSuggest) {
                    this.$.searchKeywordInput.suggestions = [];
                }

                this._keywordChanged();
                this.$.searchKeywordInput.setFocus();
            }, 100);
        },

        _keywordChanged: function (e) {
            var keyword = e && e.detail && e.detail.value ? e.detail.value : this.$.searchKeywordInput.keyword;

            if (!this.$.searchKeywordInput.selectedSuggestion && keyword.length > 2 && this.selectedSource.autoSuggest) {
                this.$.ajax.type = this.selectedSource.api.params.type;
                this.$.ajax.get(encodeURIComponent(keyword));
            }
        },

        _suggestionsLoaded: function (e) {
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
                    s.name = s.name + ' (' + (s.course_title ? (s.course_title + ' | ') : '') +
                        (s.campus ? s.campus + ', ' : '') +
                        (s.period ? s.period.toLowerCase() : '') + ')';
                    processed.push(s);
                });
            }
            else if (api.params.type === this.api.examsApi.params.type) {
                suggestions.forEach(function (s) {
                    s.origName = s.name;
                    s.type = type;
                    s.name = s.name + ' (' + (s.course_title ? (s.course_title) : '') + ')';
                    processed.push(s);
                });
            }
            else if (api.params.type === this.api.databaseApi.params.type) {
                suggestions.forEach(function (s) {
                    s.origName = s.name;
                    s.name = s.name + ' (' + (s.type == 'database' ? 'Database' : 'Subject Area') + ')';
                    s.type = type;
                    processed.push(s);
                });
            }

            var result = this._recentSuggestions();
            processed.forEach(function (p) {
                var exists = result.filter(function (v) {
                    return (v.name === p.name);
                });
                if (!exists.length) {
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

        _localStorageLoaded: function () {
            if (!this.recent || !this.recent.searches) {
                this.recent = {searches: {}};
            }

            // we only reuse the dropdown filter selection from searches less than 1 hour ago
            var oneHour = 60 * 60 * 1000;
            if (this.recent && this.recent.lastSelectedFilter
                && this._now() < this.recent.dateSaved + oneHour
            ) {
                this.selectedSourceIndex = this.recent.lastSelectedFilter;
            }
        },

        _closeSources: function (e) {
            this.$.menuSources.close();
        },

        _keywordFocused: function () {
            if (this.$.menuSources.opened) {
                this.$.menuSources.close();
            }
            else {
                this.$.menuSources.open();
            }
        },

        ready: function () {
            var self = this;
            var defaultHelpLinks = [
              {
                title: 'Search help',
                url: 'https://web.library.uq.edu.au/research-tools-techniques/uq-library-search',
                enabled: true
              },
              {
                title: 'Browse search',
                url: 'http://search.library.uq.edu.au/primo_library/libweb/action/search.do?fn=showBrowse&mode=BrowseSearch&vid=61UQ',
                enabled: true
              },
              {
                title: 'Advanced search',
                url: 'http://search.library.uq.edu.au/primo_library/libweb/action/search.do?mode=Advanced&ct=AdvancedSearch&vid=61UQ',
                enabled: true
              }
            ];

            this.sources = [
                {
                    name: 'Library',
                    type: 'all',
                    url: this.links.primo,
                    urlAppend: '&ct=facet&rfnGrpCounter=1&frbg=&&indx=1&fn=search&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&fctExcV=newspaper_articles&mulExcFctN=facet_rtype&rfnExcGrp=1&fctExcV=reviews&mulExcFctN=facet_rtype&rfnExcGrp=1',
                    autoSuggest: true,
                    api: this.api.primoApiAll,
                    icon: 'social:public',
                    inputPlaceholder: 'Find books, articles, databases, conferences and more',
                    helpLinks: defaultHelpLinks
                },
                {
                    name: 'Books',
                    type: 'books',
                    url: this.links.primo,
                    urlAppend: '&fn=search&ct=facet&fctN=facet_rtype&fctV=books&rfnGrp=1&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&dum=true',
                    autoSuggest: true,
                    api: this.api.primoApiLocal,
                    icon: 'communication:import-contacts',
                    inputPlaceholder: 'Enter a keyword, title, author, etc',
                    helpLinks: defaultHelpLinks
                },
                {
                    name: 'Journal articles',
                    type: 'journal_articles',
                    url: this.links.primo,
                    urlAppend: '&fn=search&ct=facet&fctN=facet_rtype&fctV=articles&rfnGrp=1&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&dum=true',
                    autoSuggest: true,
                    api: this.api.primoApiAll,
                    icon: 'social:school',
                    inputPlaceholder: 'Enter a keyword, article title, author, publication, etc',
                    helpLinks: defaultHelpLinks
                },
                {
                    name: 'Video & audio',
                    type: 'multimedia',
                    url: this.links.primo,
                    urlAppend: '&fn=search&ct=facet&fctN=facet_rtype&fctV=media&rfnGrp=1&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&dum=true',
                    autoSuggest: true,
                    api: this.api.primoApiAll,
                    icon: 'icons:theaters',
                    inputPlaceholder: 'Enter a keyword, title, cast, crew, composer, artist, etc',
                    helpLinks: defaultHelpLinks
                },
                {
                    name: 'Journals',
                    type: 'journals',
                    url: this.links.primo,
                    urlAppend: '&fn=search&vl(1UIStartWith0)=contains&ct=search&srt=rank&begins_with1=1&vl(D75285834UI0)=title&vid=61UQ&rfnGrpCounter=1&frbg=&&indx=1&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&tb=t&mode=Basic&tab=61uq_all&dum=true&fctIncV=journals&mulIncFctN=facet_rtype&rfnIncGrp=1',
                    autoSuggest: true,
                    api: this.api.primoApiLocal,
                    icon: 'editor:insert-drive-file',
                    inputPlaceholder: 'Enter journal or newspaper title',
                    helpLinks: defaultHelpLinks
                },
                {
                    name: 'Physical items',
                    type: 'physical_items',
                    url: this.links.primo,
                    urlAppend: '&ct=facet&fctN=facet_tlevel&fctV=physical_items&rfnGrp=show_only&frbg=&&indx=1&fn=search&dscnt=0&scp.scps=scope%3A(61UQ)%2Cprimo_central_multiple_fe&vl(1UIStartWith0)=contains&tb=t&vid=61UQ&mode=Basic&ct=search&srt=rank&tab=61uq_all&vl(D75285834UI0)=any&dum=true',
                    autoSuggest: true,
                    api: this.api.primoApiLocal,
                    icon: 'icons:inbox',
                    inputPlaceholder: 'Enter a keyword, title, author, etc',
                    helpLinks: defaultHelpLinks
                },
                {
                    name: 'Databases',
                    type: 'databases',
                    url: this.links.database,
                    autoSuggest: true,
                    api: this.api.databaseApi,
                    icon: 'editor:format-align-justify',
                    inputPlaceholder: 'Enter a keyword or database name',
                    helpLinks: [
                        {
                            title: 'Database help',
                            url: 'https://web.library.uq.edu.au/research-tools-techniques/search-techniques/searching-databases',
                            enabled: true
                        },
                        {
                          title: 'Browse databases',
                          url: 'https://app.library.uq.edu.au/#/gateways/database',
                          enabled: true
                        }
                    ]
                },
                {
                    name: 'Past exam papers',
                    type: 'exam_papers',
                    url: this.links.exams,
                    autoSuggest: true,
                    api: this.api.examsApi,
                    icon: 'icons:assessment',
                    inputPlaceholder: 'Enter a course code',
                    helpLinks: [{title: 'Browse courses', url: 'https://www.library.uq.edu.au/exams/search.html'}]
                },
                {
                    name: 'Course reading lists',
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
            this.userChoice = this._getCookie('LibrarySearchChoice') == 'newPrimo' ? 1 : 0;

            this.async(function () {
              this._toggleBetaDisplayItems(this.userChoice);
              this.$.searchKeywordInput.setFocus();
            }, 100);
        }

  });
})();
