// SPDX-License-Identifier: Apache-2.0
// BEFORE the merge: the developer's view. / 병합 전: 개발자 화면
import { createOrderSummary } from './logic.js';
import devView from './views/dev.js';

createOrderSummary(devView).mount('#app');
