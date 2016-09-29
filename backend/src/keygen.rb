require 'base64'
require_relative 'crypto.rb'

if not Dir.exist?('password')
  puts 'Creating directory password/'
  Dir.mkdir('password')
end
salt64 = if File.exist?('password/salt')
  File.open('password/salt') do |file|
    file.readline
  end
else
  nil
end
puts 'Will create password file in password/'

print 'Password ID: '
id = gets.chomp
print 'Password description: '
description = gets.chomp
print 'Master password: '
`stty -echo`
master = gets.chomp
`stty echo`
puts ''
print 'Plain password to encrypt: '
`stty -echo`
plain = gets.chomp
`stty echo`
puts ''

data = CryptoHelper.encrypt(master, plain, salt64)

if not File.exist?('password/salt')
  File.open('password/salt', 'w') do |file|
    file << data[:salt64]
  end
end

File.open("password/#{id}.p", 'w') do |file|
  file.puts(Base64.encode64(description))
  file.puts(data[:nonce64])
  file.puts(data[:ciphertext64])
end
