# gallery — component gallery / 컴포넌트 갤러리

Every layer 2 component on one page, in English and Korean: the static vs* markup, the vf* instances and their keyboard behavior. / layer2의 모든 컴포넌트를 한 페이지에서 한국어·영어로 봅니다. 정적 vs* 마크업, vf* 인스턴스와 키보드 동작.

- Each callback writes to the log line at the top, which the browser test reads. / 콜백은 맨 위의 로그 줄에 씁니다.
- The data section shows both ways to list rows: `vsTable` + `vsPagination` + app state (core file only) and `vfGrid` (data file). / 목록은 코어만으로(vsTable + vsPagination)와 데이터 파일(vfGrid) 두 방법을 보입니다.
- `/` focuses the search box (`vf.ext.shortcut`). / `/` 키로 검색칸에 갑니다.
