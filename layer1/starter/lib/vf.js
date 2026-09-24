// SPDX-License-Identifier: Apache-2.0
// The one place that says which vfunc file the app uses. Everything else imports from here.
// Development build: explains mistakes in the console. For production switch to vfunc.esm.min.js.
// 앱이 쓰는 vfunc 파일을 정하는 유일한 곳입니다. 운영에서는 vfunc.esm.min.js로 바꾸세요.
export { default } from './vfunc.esm.js';
