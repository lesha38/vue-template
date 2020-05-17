/**
 * Meta JS File that will be picked up by the Vue CLI
 */
module.exports = {
  prompts: {
    name: {
      type: 'string',
      required: true,
      message: 'App name:'
    },
    description: {
      type: 'string',
      required: false,
      message: 'Description:',
    },
    author: {
      type: 'string',
      required: false,
      message: 'Author:',
      default: 'Aleksey Ivanov <aleksey30.08@mail.ru>'
    },
    repository: {
      type: 'string',
      required: false,
      message: 'Repository:',
      default: 'git@'
    },
  },

  completeMessage: 'Application successfully created! You are awesome!'
};