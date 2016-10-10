require 'rbnacl'
require 'base64'

include RbNaCl

module CryptoHelper
  # 비밀번호와 salt로 key를 만든다
  def CryptoHelper.key(password, salt)
    PasswordHash.scrypt(
      password, salt,
      2**20, 2**24, # opslimit, memlimit
      SecretBox.key_bytes # digest_size
    )
  end
  # salt에 필요한 길이의 랜덤 바이트를 생성한다
  def CryptoHelper.generate_salt()
    RbNaCl::Random.random_bytes(PasswordHash::SCrypt::SALTBYTES)
  end
  # 평문, 비밀번호, salt로 평문을 암호화한다
  def CryptoHelper.encrypt(plain, password, salt)
    digest = CryptoHelper.key(password, salt)
    secret_box = SecretBox.new(digest)
    nonce = RbNaCl::Random.random_bytes(secret_box.nonce_bytes)
    ciphertext = secret_box.box(nonce, plain)

    {
      :nonce64 => Base64.encode64(nonce),
      :ciphertext64 => Base64.encode64(ciphertext)
    }
  end
end
