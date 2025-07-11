# Generated by Django 5.2.3 on 2025-07-07 18:44

import game_room.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game_room', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='gameroom',
            name='id',
        ),
        migrations.AddField(
            model_name='gameroom',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='gameroom',
            name='room_id',
            field=models.CharField(default=game_room.models.generate_room_id, max_length=8, primary_key=True, serialize=False, unique=True),
        ),
        migrations.AlterField(
            model_name='gameroom',
            name='users',
            field=models.ManyToManyField(blank=True, related_name='game_rooms', to=settings.AUTH_USER_MODEL),
        ),
    ]
