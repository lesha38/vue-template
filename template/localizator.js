const fs = require('fs');
const { exec } = require('child_process');
const po2json = require('po2json');
const { GettextExtractor, JsExtractors } = require('gettext-extractor');
const { po: ONLY_PO, json: ONLY_JSON } = require('minimist')(process.argv.slice(2));

const LOCALE_LIST = ['ru_RU'];
const PO_LOCALE_PATH = 'src/locale/po/';
const JSON_LOCALE_PATH = 'src/locale/json/';

const MSGMERGE_CMD = 'msgmerge "%poPath" "%potPath" -F -o "%poPath"';
const MSGINIT_CMD = 'msginit -i "%potPath" -o "%output" --locale="%locale" --no-translator';

try {
  fs.accessSync(JSON_LOCALE_PATH);
} catch (e) {
  fs.mkdirSync(JSON_LOCALE_PATH);
}

try {
  fs.accessSync(PO_LOCALE_PATH);
} catch (e) {
  fs.mkdirSync(PO_LOCALE_PATH);
}

function executeCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { encoding: 'buffer' }, (err) => {
      if (err) {
        reject(err);
      }

      console.log('EXECUTE:', cmd);
      resolve();
    });
  });
}

function createPot() {
  const extractor = new GettextExtractor();

  extractor.createJsParser([
    JsExtractors.callExpression(['$gettext', 'this.$gettext'], {
      arguments: {
        text: 0
      }
    }),
    JsExtractors.callExpression(['$ngettext', 'this.$ngettext'], {
      arguments: {
        text: 0,
        textPlural: 1,
        value: 2
      }
    }),
    JsExtractors.callExpression(['$pgettext', 'this.$pgettext'], {
      arguments: {
        context: 0,
        text: 1
      }
    }),
    JsExtractors.callExpression(['$npgettext', 'this.$npgettext'], {
      arguments: {
        context: 0,
        text: 1,
        textPlural: 2,
        value: 3
      }
    }),
  ])
  .parseFilesGlob('src/**/*.@(js|vue)');

  extractor.savePotFile(`${PO_LOCALE_PATH}en_US.pot`);
  console.log('POT-FILE IS SAVED:', `"${PO_LOCALE_PATH}en_US.pot"`);
}

function createPo() {
  const poPromises = [];
  for (const locale of LOCALE_LIST) {
    let cmd = '';

    try {
      fs.accessSync(`${PO_LOCALE_PATH + locale}.po`);

      const regexp = /%poPath|%potPath/g;
      const replacements = {
        '%poPath': `${PO_LOCALE_PATH + locale}.po`,
        '%potPath': `${PO_LOCALE_PATH}en_US.pot`
      };

      cmd = MSGMERGE_CMD.replace(regexp, (argName) => {
        return replacements[argName];
      });
    } catch (e) {
      const regexp = /%output|%locale|%potPath/g;
      const replacements = {
        '%output': `${PO_LOCALE_PATH + locale}.po`,
        '%locale': locale,
        '%potPath': `${PO_LOCALE_PATH}en_US.pot`
      };

      cmd = MSGINIT_CMD.replace(regexp, (argName) => {
        return replacements[argName];
      });

    } finally {
      poPromises.push(executeCommand(cmd));
    }
  }

  return Promise.all(poPromises);
}

function makeJSON(locale, type) {
  console.log(`EXECUTE: po2json.parseFile("${PO_LOCALE_PATH + locale}.${type}")`);

  po2json.parseFile(`${PO_LOCALE_PATH + locale}.${type}`, {
    format: 'jed1.x',
    domain: 'messages',
    stringify: true
  }, (err, jsonData) => {
    fs.open(`${JSON_LOCALE_PATH + locale}.json`, 'w', undefined, (err, fd) => {
      fs.writeSync(fd, jsonData);
      fs.close(fd, (err) => {
        if (err) {
          console.error(err);
        }
      });
    });
  });
}

function createJSON() {
  makeJSON('en_US', 'pot');
  for (const locale of LOCALE_LIST) {
    makeJSON(locale, 'po');
  }
}

if (!ONLY_JSON && !ONLY_PO) {
  createPot();
  createPo()
    .then(() => {
      createJSON();
    })
    .catch((err) => {
      console.log(err);
      createJSON();
    });

  return;
}

if (!ONLY_JSON) {
  createPot();
  createPo();
}

if (!ONLY_PO) {
  createJSON();
}
