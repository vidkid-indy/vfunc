// SPDX-License-Identifier: Apache-2.0
// Server calls. The sample reads a local JSON file; VERIFY: the real dashboard API.
// 서버 호출. 예제는 로컬 JSON을 읽습니다. VERIFY: 실제 대시보드 API
let pending = null;

export function loadDashboard() {
  if (!pending) {
    pending = fetch(new URL('./data/dashboard.json', import.meta.url)).then((response) => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    });
  }
  return pending;
}
