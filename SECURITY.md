# Security Policy / 보안 정책

## Reporting a vulnerability / 취약점 제보

**Please do not report security vulnerabilities in public issues or discussions.**
Use GitHub's **Private vulnerability reporting**: open the repository's *Security* tab and choose *Report a vulnerability*.

**보안 취약점은 공개 이슈나 Discussions에 올리지 마세요.**
저장소의 *Security* 탭에서 *Report a vulnerability*(비공개 취약점 제보)를 이용해 주세요.

Please include / 포함해 주세요:
- affected version and file / 영향받는 버전과 파일
- steps to reproduce or a minimal proof of concept / 재현 절차 또는 최소 재현 코드
- impact you expect / 예상되는 영향

## Response / 대응

This project is maintained by a small team. We aim to acknowledge reports within **72 hours** on a best-effort basis, and to publish a fix and a security advisory as soon as possible.

이 프로젝트는 소규모로 운영됩니다. 제보는 **72시간 이내** 1차 응답을 목표로 최선을 다하며, 수정 릴리스와 보안 권고를 가능한 한 빨리 공개합니다.

## Supported versions / 지원 버전

| Version | Supported |
|---|---|
| 1.x | ✅ (after the 1.0 release) |
| < 1.0 (pre-release) | ❌ |

## Scope notes / 범위 참고

- vfunc.js renders with `innerHTML`. Its escaping helpers (`vf.html`, `vf.tpl`, `vf.esc`, `vf.safeUrl`) are in scope. Code that bypasses them on purpose (`vf.unsafeHtml`) is the caller's responsibility.
- Client-side route guards are not an authorization mechanism. Authorization must be enforced on the server.
- The legacy build for Internet Explorer 11 / Edge IE mode is intended for intranet use; IE itself no longer receives security updates.
