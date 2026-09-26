// SPDX-License-Identifier: Apache-2.0
//
// IE11 dashboard — app code in ES5 (no arrow functions, const/let, template literals or classes).
// Markup is built with vf.tpl('{key}', data); vs* results are SafeHtml and go in as markup.
// vfGrid, vfChart and vfModal come from vfunc-all.legacy.min.js. The log line is read by the browser
// test (layer2/test/e2e/examples.e2e.js).
// ES5 앱 코드입니다. 마크업은 vf.tpl로 만들고, vs*의 결과는 마크업으로 들어갑니다.
/* global vf */

(function () {
  'use strict';

  function log(text) {
    document.getElementById('log').textContent = text;
  }

  document.getElementById('env').appendChild(document.createTextNode(
    'vfunc ' + vf.version + ' · documentMode: ' + (document.documentMode || '-')));

  vf.i18n.add('en', { report: { title: 'Branch report', branch: 'Branch', city: 'City', visits: 'Visits', growth: 'Growth',
    total: 'Total visits', best: 'Best branch', details: 'Branch details', chart: 'Visits per quarter' } });
  vf.i18n.add('ko', { report: { title: '지점 보고서', branch: '지점', city: '도시', visits: '방문', growth: '성장률',
    total: '전체 방문', best: '최고 지점', details: '지점 상세', chart: '분기별 방문' } });
  var t = vf.t;

  var BRANCHES = [
    { id: 'b1', name: 'Gangnam', city: 'Seoul', visits: 1840, growth: 0.12 },
    { id: 'b2', name: 'Haeundae', city: 'Busan', visits: 1320, growth: 0.05 },
    { id: 'b3', name: 'Dunsan', city: 'Daejeon', visits: 760, growth: -0.03 },
    { id: 'b4', name: 'Suseong', city: 'Daegu', visits: 980, growth: 0.08 },
    { id: 'b5', name: 'Bupyeong', city: 'Incheon', visits: 1105, growth: 0.02 },
    { id: 'b6', name: 'Sangmu', city: 'Gwangju', visits: 640, growth: 0.1 }
  ];

  function total() {
    var sum = 0;
    for (var i = 0; i < BRANCHES.length; i++) sum += BRANCHES[i].visits;
    return sum;
  }

  var stats = vf.attach('#stats', {
    render: function () {
      return vf.tpl('{a}{b}', {
        a: vf.vsStatCard({ label: t('report.total'), value: total(), delta: 6.4 }),
        b: vf.vsStatCard({ label: t('report.best'), value: BRANCHES[0].name })
      });
    }
  });

  // One dialog, filled before it opens.
  var details = vf.vfModal({ id: 'details', title: t('report.details'), size: 'sm' });

  function columns() {
    return [
      { key: 'name', label: t('report.branch'), sortable: true },
      { key: 'city', label: t('report.city'), sortable: true },
      { key: 'visits', label: t('report.visits'), sortable: true, align: 'end', render: function (row) { return vf.fmt.number(row.visits); } },
      { key: 'growth', label: t('report.growth'), align: 'end', render: function (row) {
        return vf.vsBadge({ label: vf.fmt.number(row.growth, { style: 'percent' }), variant: row.growth < 0 ? 'danger' : 'success' });
      } }
    ];
  }

  var grid = vf.vfGrid({
    id: 'branches', caption: t('report.title'), data: BRANCHES, pageSize: 5, columns: columns(),
    onSort: function (e) { log('sort ' + e.data.key + ' ' + e.data.dir); },
    onRowClick: function (e) {
      var row = e.data.row;
      details.setState({ title: row.name, content: vf.vsDescriptions({ columns: 1, items: [
        { label: t('report.city'), value: row.city },
        { label: t('report.visits'), value: vf.fmt.number(row.visits) },
        { label: t('report.growth'), value: vf.fmt.number(row.growth, { style: 'percent' }) }
      ] }) });
      details.open();
      log('row ' + e.data.key);
    }
  });
  grid.mount('#grid');

  var chart = vf.vfChart({
    id: 'visits', type: 'line', label: t('report.chart'), dataTable: true,
    data: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], series: [
      { name: 'Seoul', data: [410, 450, 470, 510] },
      { name: 'Busan', data: [300, 320, 340, 360] }
    ] },
    onClick: function (e) { log('chart ' + e.data.series + ' ' + e.data.label); }
  });
  chart.mount('#chart');

  vf.vfSelectButton({ id: 'langs', ariaLabel: 'Language', value: 'en', size: 'sm',
    options: [{ value: 'en', label: 'English' }, { value: 'ko', label: '한국어' }],
    onChange: function (e) { vf.i18n.set(e.data.value); } }).mount('#lang');

  vf.i18n.setup({ locale: 'en', locales: ['en', 'ko'] });
  vf.i18n.subscribe(function () {
    document.getElementById('title').textContent = t('report.title');
    stats.refresh();
    grid.setColumns(columns());
    chart.refresh();
  });
}());
