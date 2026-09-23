# Contributing / 기여 안내

Thank you for your interest in vfunc.js. / vfunc.js에 관심을 가져 주셔서 감사합니다.

## Before you start / 시작하기 전에

- Questions and ideas: use **GitHub Discussions**. Bug reports: use **Issues**.
  질문과 아이디어는 **Discussions**, 버그는 **Issues**에 올려 주세요.
- Security vulnerabilities: **do not open a public issue.** See [SECURITY.md](SECURITY.md).
  보안 취약점은 공개 이슈로 올리지 말고 [SECURITY.md](SECURITY.md)를 따라 주세요.
- To add features without changing vfunc itself, see [EXTENDING.md](EXTENDING.md).
  vfunc를 고치지 않고 기능을 더하려면 [EXTENDING.md](EXTENDING.md)를 보세요.

## Developer Certificate of Origin (DCO)

All commits must be signed off. By signing off, you certify that you wrote the change or have the right to submit it under the project's license ([developercertificate.org](https://developercertificate.org/)).

모든 커밋에 sign-off가 필요합니다. sign-off는 "이 변경을 직접 작성했거나 프로젝트 라이선스로 제출할 권리가 있다"는 확인입니다.

```bash
git commit -s -m "fix: ..."
# adds: Signed-off-by: Your Name <you@example.com>
```

## Rules for code / 코드 규칙

- Keep layer dependencies one-way: layer1 ← layer2 ← layer3. Layer 2 and above use only the public API of layer 1.
- `vs*` functions always return a string; `vf*` functions always return an instance.
- Build dynamic HTML with `vf.html` (auto-escaping). Never interpolate into `on*` attributes.
- Bind events to `data-action` / `data-ref`, never to CSS classes.
- Use CSS tokens (`var(--vf-*)`) instead of raw colors and sizes.
- Add a test for every change. Public API changes also update `types/vfunc.d.ts`, `CHANGELOG.md` and the docs.
- Third-party code: add it to `third-party.json`. Only MIT, Apache-2.0, BSD, ISC or OFL licenses are accepted.

## Adapters / 어댑터 기여

Official adapters must start from `layer2/adapters/_template` and pass the contract tests in `layer2/adapters/_contract` (available from stage 2). Other adapters are welcome as separate packages named `vfunc-adapter-*`; we list them on the site.

공식 어댑터는 `_template`에서 시작하고 `_contract` 계약 테스트를 통과해야 합니다(2단계부터 제공). 그 밖의 어댑터는 `vfunc-adapter-*` 이름의 별도 패키지로 만들어 주시면 사이트에 소개합니다.
