from django.urls import path
from .views import create_room, join_room, leave_room, player_finished, get_gpt_questions

urlpatterns = [
    path("create-room", create_room),
    path("join-room", join_room),
    path("leave-room", leave_room),
    path("player-finished", player_finished),
    path('gpt-questions/', get_gpt_questions),
]
