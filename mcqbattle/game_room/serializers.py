# in serializers.py
from rest_framework import serializers
from .models import GameRoom

class GameRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameRoom
        fields = ['room_id', 'questions', 'users', 'created_at']
