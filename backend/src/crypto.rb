require 'rbnacl'
require 'base64'

include RbNaCl

module CryptoHelper
  def CryptoHelper.key(password, salt)
    PasswordHash.scrypt(
      password, salt,
      2**20, 2**24, # opslimit, memlimit
      SecretBox.key_bytes # digest_size
    )
  end
  def CryptoHelper.encrypt(password, plain, salt64=nil)
    salt = if salt64
      Base64.decode64(salt64)
    else
      RbNaCl::Random.random_bytes(PasswordHash::SCrypt::SALTBYTES)
    end
    digest = CryptoHelper.key(password, salt)
    secret_box = SecretBox.new(digest)
    nonce = RbNaCl::Random.random_bytes(secret_box.nonce_bytes)
    ciphertext = secret_box.box(nonce, plain)

    {
      :salt64 => Base64.encode64(salt),
      :nonce64 => Base64.encode64(nonce),
      :ciphertext64 => Base64.encode64(ciphertext)
    }
  end
end
