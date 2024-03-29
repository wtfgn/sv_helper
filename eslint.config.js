/* eslint-env node */
// require('@rushstack/eslint-patch/modern-module-resolution')
import antfu from '@antfu/eslint-config';

// module.exports = {
//   root: true,
//   'extends': [
//     'plugin:vue/vue3-essential',
//     'eslint:recommended',
//     '@vue/eslint-config-typescript'
//   ],
//   parserOptions: {
//     ecmaVersion: 'latest'
//   }
// }

export default antfu({
  rules: {
    'style/semi': ['error', 'always'],
  },
  vue: {
    overrides: {
      'vue/block-order': ['error', {
        order: ['template', 'script', 'style'],
      }],
    },
  },
});
