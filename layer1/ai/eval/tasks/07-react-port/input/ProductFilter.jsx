import { useEffect, useMemo, useState } from 'react';
import './ProductFilter.css';

const CATEGORIES = [
  ['all', 'All'],
  ['keyboard', 'Keyboards'],
  ['mouse', 'Mice'],
  ['monitor', 'Monitors']
];
const SORTS = [
  ['name', 'Name'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low']
];
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function ProductFilter() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState('name');

  useEffect(() => {
    let alive = true;
    fetch('./data/products.json')
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((data) => {
        if (alive) {
          setItems(data);
          setStatus('ready');
        }
      })
      .catch(() => alive && setStatus('error'));
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const order = {
      name: (a, b) => a.name.localeCompare(b.name, 'en'),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price
    }[sort];
    return items
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) => !inStock || p.stock > 0)
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .sort(order);
  }, [items, query, category, inStock, sort]);

  if (status === 'loading') return <p className="pf__note" role="status">Loading products…</p>;
  if (status === 'error') return <p className="pf__note pf__note--error" role="alert">Could not load products.</p>;

  return (
    <section className="pf">
      <div className="pf__controls">
        <label className="pf__field">
          Search
          <input className="pf__input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="pf__field">
          Category
          <select className="pf__input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="pf__check">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          In stock only
        </label>
        <label className="pf__field">
          Sort
          <select className="pf__input" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="pf__count">{shown.length === 1 ? '1 product' : `${shown.length} products`}</p>
      {shown.length === 0 ? (
        <p className="pf__empty">No products found.</p>
      ) : (
        <ul className="pf__list">
          {shown.map((p) => (
            <li key={p.id} className={'pf__item' + (p.stock === 0 ? ' pf__item--out' : '')}>
              <span className="pf__name">{p.name}</span>
              <span className="pf__price">{money.format(p.price)}</span>
              {p.stock === 0 && <span className="pf__badge">Sold out</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
