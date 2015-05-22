json.array!(@value_for_searches) do |value_for_search|
  json.extract! value_for_search, :id, :product, :title, :description, :keywords
  json.url value_for_search_url(value_for_search, format: :json)
end
