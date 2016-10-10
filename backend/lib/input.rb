module InputHelper
  def InputHelper.input(description)
    print description + ': '
    gets.chomp
  end
  def InputHelper.input_secret(description)
    print description + ': '
    `stty -echo`
    result = gets.chomp
    `stty echo`
    puts ''
    result
  end
end
