# 바쿠스 비밀번호 관리 시스템 백엔드

```sh
# Install dependencies
bundle

# Make some password files
keygen

# Run the development server
ruby src/app.rb
```

## API

### `POST /password.json`

비밀번호 목록을 받아옵니다.

#### Arguments

* `password`
  * 필수. 비밀번호 목록에 접근하기 위한 마스터 비밀번호입니다.

#### Response

* `Password`의 배열
  * `id`
  * `description`
  * `password`
