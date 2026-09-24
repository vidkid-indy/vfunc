// SPDX-License-Identifier: Apache-2.0
// 19 design-apply — the logic below is the same for every skin (JS diff 0).
// It follows the separation rules: behaviour on data-action / data-ref, state in aria-* / data-state,
// no design values in JS. / 아래 로직은 모든 스킨에서 같습니다(JS 변경 0).

const profile = vf.vfunc({
  state: { following: false, followers: 1280, posts: [
    { id: 1, text: 'Shipped the design token contract', fresh: true },
    { id: 2, text: 'Wrote the migration guide', fresh: false }
  ] },
  render: (s) => vf.html`
    <article class="profile">
      <div class="profile__top">
        <div class="profile__avatar" aria-hidden="true">MK</div>
        <div>
          <h2 class="profile__name">Minsu Kim</h2>
          <p class="profile__role">Front-end engineer · Seoul</p>
        </div>
      </div>
      <div class="profile__stats">
        <div class="stat"><span class="stat__value" data-ref="followers">${vf.fmt.number(s.followers)}</span><span class="stat__label">Followers</span></div>
        <div class="stat"><span class="stat__value">${s.posts.length}</span><span class="stat__label">Posts</span></div>
        <div class="stat"><span class="stat__value">4.9</span><span class="stat__label">Rating</span></div>
      </div>
      <div class="profile__actions">
        <button class="button" type="button" data-action="follow" data-variant="primary" aria-pressed="${s.following ? 'true' : 'false'}">
          ${s.following ? 'Following' : 'Follow'}</button>
        <button class="button" type="button" data-action="post">Add post</button>
      </div>
      <ul class="feed" data-ref="feed">${s.posts.map((p) => vf.html`
        <li class="feed__item" data-state="${p.fresh ? 'new' : 'read'}">${p.text}</li>`)}</ul>
    </article>`,
  delegates: [
    {
      selector: '[data-action="follow"]',
      eventType: 'click',
      onEvent: (e) => e.sender.setState({ following: !e.sender.following, followers: e.sender.followers + (e.sender.following ? -1 : 1) })
    },
    {
      selector: '[data-action="post"]',
      eventType: 'click',
      onEvent: (e) => e.sender.setState({ posts: [{ id: e.sender.posts.length + 1, text: 'A new post', fresh: true }].concat(e.sender.posts) })
    }
  ]
});

profile.mount('#app');
