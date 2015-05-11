module Acses_denied

    def acses_denied_for_action_index
      if current_user
        if current_user.email == admin_email
          render "index"
        else
          render "denied"
        end
      else
        render "denied"
      end
    end

    def acses_denied_for_action_show
      if current_user
        if current_user.email == admin_email
          render "show"
        else
          render "denied"
        end
      else
        render "denied"
      end
    end

    def acses_denied_for_action_edit
      if current_user
        if current_user.email == admin_email
          render "edit"
        else
          render "denied"
        end
      else
        render "denied"
      end
    end
end
