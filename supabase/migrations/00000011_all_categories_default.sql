-- All users receive missions from every category (category selection removed from app).
update public.user_preferences
set categories = array[
  'social','nature','curiosity','adventure','creativity','calm','learning'
]::public.mission_category[];
