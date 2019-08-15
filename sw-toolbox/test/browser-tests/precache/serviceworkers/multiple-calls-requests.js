/*
  Copyright 2016 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

/* eslint-env worker, serviceworker */

importScripts('/sw-toolbox.js');

self.toolbox.options.cache = {
  name: 'precache-valid'
};

self.toolbox.precache([
  new Request('/test/data/files/text.txt', {mode: 'cors'}),
  new Request('/test/data/files/text-1.txt', {mode: 'cors'})
]);

self.toolbox.precache([
  new Request('/test/data/files/text-2.txt', {mode: 'cors'})
]);

self.toolbox.precache([
  new Request('/test/data/files/text-3.txt', {mode: 'cors'}),
  new Request('/test/data/files/text-4.txt', {mode: 'cors'})
]);
