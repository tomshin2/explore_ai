const { registerHooks } = require('module');
const { pathToFileURL } = require('url');
const path = require('path');

const libDir = path.join(__dirname, '..', '..', 'lib');
const asyncStorageURL = pathToFileURL(path.join(__dirname, 'async-storage-stub.mjs')).href;
const urlPolyfillURL = pathToFileURL(path.join(__dirname, 'url-polyfill-stub.mjs')).href;
const libFileURL = pathToFileURL(libDir + path.sep).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '@react-native-async-storage/async-storage') {
      return nextResolve(asyncStorageURL, context);
    }
    if (specifier.startsWith('react-native-url-polyfill')) {
      return nextResolve(urlPolyfillURL, context);
    }
    if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      !specifier.endsWith('.ts') &&
      context.parentURL?.startsWith(libFileURL)
    ) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});
