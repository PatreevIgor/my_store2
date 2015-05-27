class UserMailer < ApplicationMailer
  def welcome_email
    @order = Order.last
    mail(to: 'intertronshop@gmail.com', subject: 'Новый заказ на Intertron.by')
  end
end
