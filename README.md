# Vue Templates

### Создание нового приложения

Для того, чтобы развернуть новое приложение нужно установить утилиту [@vue/cli](https://cli.vuejs.org/) и вызвать команду [vue init](https://cli.vuejs.org/ru/guide/creating-a-project.html#%D1%88%D0%B0%D0%B1n%D0%BE%D0%BD%D1%8B-%D0%B4n%D1%8F-%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D0%B8-2-x-%D1%81%D1%82%D0%B0%D1%80%D0%BE%D0%B5-%D0%BF%D0%BE%D0%B2%D0%B5%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5):

```sh
$ npm install @vue/cli @vue/cli-init -g
$ vue init github.com:lesha38/vue-template <app-name> -c
```

### Скрипты

| Скрипт | Описание |
| ------ | ------ |
| start | сборка и запуск приложения на дев сервере |
| build | параллельная сборка продакшен и дебаг версии  |
| build-prod | сборка продакшен версии |
| build-dev | сборка дев версии с вотчером |
| build-debug | сборка дебаг версии |
| locale | сборка PO и JSON файлов переводов |
| locale-po | сборка PO-файлов переводов |
| locale-json | сборка JSON-файлов переводов |
| lint | запуск eslint |
| lint-fix | запуск eslint c автоматическим исправлением |
