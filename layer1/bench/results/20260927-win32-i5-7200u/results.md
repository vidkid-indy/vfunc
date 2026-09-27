# Benchmark results / 벤치마크 결과 — 2026-09-27

- Windows_NT 10.0.26200 (win32), Intel(R) Core(TM) i5-7200U CPU @ 2.50GHz, vfunc 1.0.1, 1000 rows, median of 10 runs after 5 warm-up runs (ms)
- Node 24.19.0, Playwright 1.63.0, 4 cores, 8 GB
- Time: from the click to the end of the forced style and layout after the render (`layout`). The time to the second animation frame (`frame`, includes waiting for the display) is in results.json.
- 시간: 클릭부터 렌더 뒤 강제 스타일·레이아웃이 끝날 때까지(`layout`). 두 번째 애니메이션 프레임까지의 시간(`frame`, 화면 주기 대기 포함)은 results.json에 있습니다.
- In parentheses: the ratio to vanilla. / 괄호 안: vanilla 대비 배수.

| Operation / 조작 | What / 내용 |
|---|---|
| create rows | create 1000 rows in an empty table |
| create many rows | create 10000 rows in an empty table |
| append rows | append 1000 rows to 1000 rows |
| partial update | change the label of every 10th row of 1000 |
| select row | highlight one row of 1000 |
| swap rows | swap two rows of 1000 |
| remove row | remove one row of 1000 |
| clear rows | remove all 1000 rows |

## chromium 153.0.8010.12

| | vfunc naive | vfunc recommended | vanilla |
|---|---:|---:|---:|
| create rows | 133.1 (1.3×) | 132.4 (1.3×) | 102.8 |
| create many rows | 1394.6 (1.3×) | 1439.4 (1.3×) | 1093.5 |
| append rows | 260.5 (2.6×) | 258.1 (2.5×) | 101.7 |
| partial update | 130.2 (4.1×) | 132.3 (4.2×) | 31.4 |
| select row | 91.8 (459.0×) | 0.4 (2.0×) | 0.2 |
| swap rows | 88.4 (12.1×) | 104.3 (14.3×) | 7.3 |
| remove row | 96.1 (14.1×) | 88.9 (13.1×) | 6.8 |
| clear rows | 8.2 (1.1×) | 9.2 (1.2×) | 7.8 |
| startup | 72.2 | 88.0 | 78.0 |
| memory (after create) | 1.3 MB | 1.3 MB | 1.4 MB |
| script size (gzip) | 10.05 KB | 10.17 KB | 1.26 KB |

<details><summary>min – max</summary>

| | vfunc naive | vfunc recommended | vanilla |
|---|---:|---:|---:|
| create rows | 129.4 – 154.5 | 129.1 – 136.3 | 96.3 – 125.2 |
| create many rows | 1269.0 – 1627.3 | 1302.5 – 1657.4 | 925.7 – 1238.8 |
| append rows | 254.3 – 279.5 | 252.2 – 321.7 | 97.3 – 128.7 |
| partial update | 126.4 – 135.1 | 127.9 – 155.5 | 9.5 – 40.2 |
| select row | 79.7 – 96.9 | 0.3 – 0.7 | 0.1 – 0.4 |
| swap rows | 75.5 – 123.4 | 87.3 – 126.6 | 6.8 – 8.7 |
| remove row | 82.9 – 128.2 | 77.5 – 96.9 | 6.4 – 8.2 |
| clear rows | 5.6 – 8.8 | 8.4 – 9.6 | 7.0 – 8.9 |

</details>

## firefox 155.0

| | vfunc naive | vfunc recommended | vanilla |
|---|---:|---:|---:|
| create rows | 128.0 (1.4×) | 147.0 (1.7×) | 89.0 |
| create many rows | 1209.0 (1.2×) | 1137.0 (1.1×) | 1006.0 |
| append rows | 290.5 (2.3×) | 347.5 (2.8×) | 125.0 |
| partial update | 164.5 (3.1×) | 183.5 (3.4×) | 53.5 |
| select row | 166.5 (166.5×) | 1.0 (1.0×) | 1.0 |
| swap rows | 236.5 (12.4×) | 254.5 (13.4×) | 19.0 |
| remove row | 220.0 (12.9×) | 240.0 (14.1×) | 17.0 |
| clear rows | 16.5 (0.7×) | 25.0 (1.0×) | 24.5 |
| startup | 222.5 | 194.5 | 215.5 |
| script size (gzip) | 10.05 KB | 10.17 KB | 1.26 KB |

<details><summary>min – max</summary>

| | vfunc naive | vfunc recommended | vanilla |
|---|---:|---:|---:|
| create rows | 104.0 – 167.0 | 108.0 – 176.0 | 79.0 – 129.0 |
| create many rows | 1118.0 – 1328.0 | 1085.0 – 1609.0 | 945.0 – 1317.0 |
| append rows | 244.0 – 373.0 | 226.0 – 379.0 | 91.0 – 150.0 |
| partial update | 150.0 – 185.0 | 156.0 – 193.0 | 13.0 – 69.0 |
| select row | 155.0 – 209.0 | 1.0 – 1.0 | 0.0 – 2.0 |
| swap rows | 207.0 – 273.0 | 236.0 – 350.0 | 14.0 – 25.0 |
| remove row | 194.0 – 308.0 | 203.0 – 327.0 | 15.0 – 32.0 |
| clear rows | 14.0 – 27.0 | 20.0 – 36.0 | 19.0 – 43.0 |

</details>

## webkit 26.6

| | vfunc naive | vfunc recommended | vanilla |
|---|---:|---:|---:|
| create rows | 409.5 (1.2×) | 368.5 (1.1×) | 339.5 |
| create many rows | 3759.0 (0.9×) | 4476.5 (1.1×) | 4156.5 |
| append rows | 948.5 (2.3×) | 881.0 (2.1×) | 411.5 |
| partial update | 429.0 (2.6×) | 449.5 (2.8×) | 162.5 |
| select row | 437.0 (437.0×) | 1.0 (1.0×) | 1.0 |
| swap rows | 422.0 (38.4×) | 454.5 (41.3×) | 11.0 |
| remove row | 470.0 (47.0×) | 448.5 (44.9×) | 10.0 |
| clear rows | 26.5 (0.9×) | 32.0 (1.1×) | 29.5 |
| startup | 117.0 | 106.0 | 96.5 |
| script size (gzip) | 10.05 KB | 10.17 KB | 1.26 KB |

<details><summary>min – max</summary>

| | vfunc naive | vfunc recommended | vanilla |
|---|---:|---:|---:|
| create rows | 395.0 – 481.0 | 331.0 – 417.0 | 286.0 – 389.0 |
| create many rows | 3325.0 – 4541.0 | 3873.0 – 4824.0 | 4077.0 – 4484.0 |
| append rows | 889.0 – 1110.0 | 811.0 – 985.0 | 396.0 – 621.0 |
| partial update | 410.0 – 458.0 | 427.0 – 484.0 | 18.0 – 177.0 |
| select row | 413.0 – 471.0 | 1.0 – 2.0 | 1.0 – 1.0 |
| swap rows | 391.0 – 462.0 | 438.0 – 490.0 | 10.0 – 12.0 |
| remove row | 431.0 – 513.0 | 421.0 – 502.0 | 9.0 – 11.0 |
| clear rows | 25.0 – 32.0 | 30.0 – 42.0 | 28.0 – 32.0 |

</details>
