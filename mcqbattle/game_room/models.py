from django.db import models
import uuid
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

def generate_room_id():
    return str(uuid.uuid4())[:8]

class GameRoom(models.Model):
    room_id = models.CharField(primary_key=True, max_length=8, unique=True, default= generate_room_id)
    users = models.ManyToManyField(User, blank=True)
    questions = models.JSONField()
    player1_finished = models.BooleanField(default=False)
    player2_finished = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Room {self.room_id}"
