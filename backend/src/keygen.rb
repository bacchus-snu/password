require 'base64'
require_relative 'crypto.rb'

if not Dir.exist?('password')
  puts 'Creating directory password/'
  Dir.mkdir('password')
end
salt64, crypt_nonce64, crypt_master64 = if File.exist?('password/salt')
  File.open('password/salt') do |file|
    salt64 = file.readline
    crypt_nonce64 = file.readline
    crypt_master64 = file.readline
    [salt64, crypt_nonce64, crypt_master64]
  end
else
  puts 'Initializing the password storage for the first time.'
  salt = CryptoHelper.generate_salt()
  print 'Master password: '
  `stty -echo`
  master = gets.chomp
  `stty echo`
  puts ''
  salt64 = Base64.encode64(salt)
  crypt_result = CryptoHelper.encrypt(master, salt, salt64)
  crypt_master64 = crypt_result[:ciphertext64].gsub(/\n/, '')
  crypt_nonce64 = crypt_result[:nonce64].gsub(/\n/, '')
  File.open('password/salt', 'w') do |file|
    file.puts(salt64)
    file.puts(crypt_nonce64)
    file.puts(crypt_master64)
  end
  [salt64, crypt_nonce64, crypt_master64]
end
puts 'Will create password file in password/'

print 'Verify master password: '
`stty -echo`
master = gets.chomp
`stty echo`
puts ''

begin
  salt = Base64.decode64(salt64)
  secret_box = RbNaCl::SecretBox::new(CryptoHelper.key(master, salt))
  dec_salt = secret_box.open(
    Base64.decode64(crypt_nonce64),
    Base64.decode64(crypt_master64)
  )
  raise 'Salt does not match' unless RbNaCl::Util.verify32(
    RbNaCl::Hash.sha256(dec_salt),
    RbNaCl::Hash.sha256(salt)
  )
rescue
  puts 'Password verification failed.'
  exit 1
end

print 'Password ID: '
id = gets.chomp
print 'Password description: '
description = gets.chomp
print 'Plain password to encrypt: '
`stty -echo`
plain = gets.chomp
`stty echo`
puts ''

data = CryptoHelper.encrypt(master, plain, salt64)

File.open("password/#{id}.p", 'w') do |file|
  file.puts(Base64.encode64(description))
  file.puts(data[:nonce64])
  file.puts(data[:ciphertext64])
end
