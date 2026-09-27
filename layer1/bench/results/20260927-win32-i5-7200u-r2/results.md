# Benchmark results / 벤치마크 결과 — 2026-09-27

- Windows_NT 10.0.26200 (win32), Intel(R) Core(TM) i5-7200U CPU @ 2.50GHz, vfunc 1.1.0, 1000 rows, median of 10 runs after 5 warm-up runs (ms)
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

| | vfunc naive | vfunc recommended | vfunc + vfList | vanilla |
|---|---:|---:|---:|---:|
| create rows | 51.8 (1.1×) | 56.6 (1.2×) | 51.9 (1.1×) | 45.8 |
| create many rows | 533.6 (0.9×) | 692.0 (1.2×) | 605.6 (1.1×) | 570.2 |
| append rows | 124.8 (2.3×) | 109.1 (2.0×) | 70.6 (1.3×) | 54.0 |
| partial update | 53.8 (3.0×) | 56.2 (3.1×) | 25.3 (1.4×) | 18.0 |
| select row | 53.1 (265.5×) | 0.3 (1.5×) | 5.3 (26.5×) | 0.2 |
| swap rows | 56.1 (9.7×) | 54.6 (9.4×) | 6.9 (1.2×) | 5.8 |
| remove row | 52.8 (9.1×) | 55.9 (9.6×) | 6.7 (1.2×) | 5.8 |
| clear rows | 6.7 (1.1×) | 6.0 (1.0×) | 5.8 (0.9×) | 6.2 |
| startup | 68.2 | 79.0 | 82.2 | 69.6 |
| memory (after create) | 1.3 MB | 1.3 MB | 1.4 MB | 1.4 MB |
| script size (gzip) | 10.39 KB | 10.52 KB | 12.20 KB | 1.26 KB |

<details><summary>min – max</summary>

| | vfunc naive | vfunc recommended | vfunc + vfList | vanilla |
|---|---:|---:|---:|---:|
| create rows | 48.3 – 94.1 | 50.2 – 93.3 | 51.0 – 58.0 | 44.1 – 49.7 |
| create many rows | 479.2 – 606.4 | 515.3 – 783.0 | 508.9 – 789.9 | 478.4 – 718.3 |
| append rows | 98.7 – 157.7 | 100.4 – 155.2 | 55.3 – 84.5 | 48.1 – 71.9 |
| partial update | 48.3 – 59.9 | 51.7 – 71.2 | 13.3 – 36.5 | 7.1 – 26.8 |
| select row | 48.5 – 57.7 | 0.2 – 0.6 | 4.0 – 9.7 | 0.1 – 0.3 |
| swap rows | 50.2 – 95.2 | 49.1 – 61.2 | 5.1 – 8.6 | 3.8 – 7.0 |
| remove row | 49.7 – 72.5 | 50.0 – 66.9 | 4.7 – 7.7 | 3.9 – 6.7 |
| clear rows | 4.5 – 9.1 | 4.7 – 20.7 | 4.4 – 7.4 | 4.2 – 7.0 |

</details>

## firefox 155.0

| | vfunc naive | vfunc recommended | vfunc + vfList | vanilla |
|---|---:|---:|---:|---:|
| create rows | 66.5 (1.1×) | 81.5 (1.3×) | 68.0 (1.1×) | 61.0 |
| create many rows | 658.0 (1.1×) | 648.5 (1.0×) | 694.5 (1.1×) | 626.5 |
| append rows | 131.0 (1.8×) | 130.5 (1.8×) | 83.0 (1.2×) | 71.0 |
| partial update | 67.0 (3.0×) | 68.0 (3.1×) | 32.0 (1.5×) | 22.0 |
| select row | 68.0 (68.0×) | 0.5 (0.5×) | 7.0 (7.0×) | 1.0 |
| swap rows | 67.0 (9.6×) | 68.0 (9.7×) | 9.0 (1.3×) | 7.0 |
| remove row | 66.5 (7.8×) | 70.0 (8.2×) | 8.0 (0.9×) | 8.5 |
| clear rows | 8.0 (0.9×) | 9.0 (1.0×) | 9.0 (1.0×) | 9.0 |
| startup | 126.0 | 131.5 | 133.5 | 114.5 |
| script size (gzip) | 10.39 KB | 10.52 KB | 12.20 KB | 1.26 KB |

<details><summary>min – max</summary>

| | vfunc naive | vfunc recommended | vfunc + vfList | vanilla |
|---|---:|---:|---:|---:|
| create rows | 63.0 – 82.0 | 63.0 – 118.0 | 65.0 – 77.0 | 60.0 – 81.0 |
| create many rows | 635.0 – 759.0 | 618.0 – 902.0 | 666.0 – 718.0 | 610.0 – 877.0 |
| append rows | 129.0 – 157.0 | 126.0 – 163.0 | 73.0 – 109.0 | 68.0 – 137.0 |
| partial update | 66.0 – 81.0 | 67.0 – 71.0 | 18.0 – 45.0 | 13.0 – 23.0 |
| select row | 65.0 – 95.0 | 0.0 – 1.0 | 7.0 – 12.0 | 0.0 – 1.0 |
| swap rows | 64.0 – 81.0 | 66.0 – 97.0 | 8.0 – 13.0 | 6.0 – 8.0 |
| remove row | 66.0 – 69.0 | 66.0 – 232.0 | 7.0 – 19.0 | 7.0 – 13.0 |
| clear rows | 6.0 – 12.0 | 8.0 – 15.0 | 8.0 – 10.0 | 7.0 – 16.0 |

</details>

## webkit 26.6

| | vfunc naive | vfunc recommended | vfunc + vfList | vanilla |
|---|---:|---:|---:|---:|
| create rows | 176.0 (1.0×) | 184.0 (1.1×) | 190.5 (1.1×) | 173.0 |
| create many rows | 2109.0 (1.0×) | 2174.5 (1.0×) | 2184.5 (1.0×) | 2096.5 |
| append rows | 373.5 (2.0×) | 373.5 (2.0×) | 201.0 (1.1×) | 188.5 |
| partial update | 181.0 (2.2×) | 183.0 (2.2×) | 108.5 (1.3×) | 83.0 |
| select row | 182.0 (182.0×) | 1.0 (1.0×) | 6.0 (6.0×) | 1.0 |
| swap rows | 181.5 (30.3×) | 184.0 (30.7×) | 7.0 (1.2×) | 6.0 |
| remove row | 183.0 (36.6×) | 182.0 (36.4×) | 6.5 (1.3×) | 5.0 |
| clear rows | 14.0 (0.9×) | 15.0 (1.0×) | 15.0 (1.0×) | 15.0 |
| startup | 71.0 | 69.5 | 74.5 | 66.5 |
| script size (gzip) | 10.39 KB | 10.52 KB | 12.20 KB | 1.26 KB |

<details><summary>min – max</summary>

| | vfunc naive | vfunc recommended | vfunc + vfList | vanilla |
|---|---:|---:|---:|---:|
| create rows | 171.0 – 187.0 | 177.0 – 199.0 | 179.0 – 255.0 | 167.0 – 185.0 |
| create many rows | 2031.0 – 2182.0 | 2103.0 – 2328.0 | 2146.0 – 2265.0 | 2048.0 – 2173.0 |
| append rows | 359.0 – 482.0 | 359.0 – 405.0 | 190.0 – 292.0 | 182.0 – 384.0 |
| partial update | 176.0 – 219.0 | 178.0 – 199.0 | 29.0 – 119.0 | 9.0 – 95.0 |
| select row | 177.0 – 226.0 | 0.0 – 1.0 | 5.0 – 6.0 | 0.0 – 1.0 |
| swap rows | 177.0 – 214.0 | 181.0 – 194.0 | 6.0 – 10.0 | 5.0 – 6.0 |
| remove row | 179.0 – 223.0 | 181.0 – 229.0 | 5.0 – 10.0 | 4.0 – 9.0 |
| clear rows | 13.0 – 21.0 | 15.0 – 16.0 | 15.0 – 17.0 | 14.0 – 16.0 |

</details>
