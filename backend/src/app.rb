require 'json'
require 'base64'
require 'sinatra'
require 'rbnacl'
require_relative 'crypto'

salt = File.open('password/salt') do |file|
  Base64.decode64(file.readline)
end

def passwordList()
  Dir['password/*.p'].collect do |item|
    data = File.open(item) do |file|
      description = Base64.decode64(file.readline).force_encoding('utf-8')
      nonce = Base64.decode64(file.readline)
      ciphertext = Base64.decode64(file.readline)
      {
        :description => description,
        :nonce => nonce,
        :ciphertext => ciphertext
      }
    end
    id = File.basename(item, '.p')
    data.merge({ :id => id })
  end
end

post '/password.json' do
  passwords = passwordList

  password = params['password']
  secret_box = RbNaCl::SecretBox::new(CryptoHelper.key(password, salt))

  # TODO: Optional filtering feature
  filtered_passwords = passwords
  begin
    response = filtered_passwords.collect do |item|
      {
        :id => item[:id],
        :description => item[:description],
        :password => secret_box.open(item[:nonce], item[:ciphertext])
      }
    end
  rescue
    status 401
    response = {
      :error => "Authentication failed."
    }
  end
  JSON.generate response
end
