import uuid
# import openai
# import os
# from openai import OpenAI
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from decouple import config
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
import pusher
import google.generativeai as genai
from .models import GameRoom
from .serializers import GameRoomSerializer
from django.contrib.auth import get_user_model
User = get_user_model()

room_data = {}

@api_view(["POST"])
def create_room(request):
    user_id = request.data.get("user_id")
    category = request.data.get("category", "general knowledge")
    difficulty = request.data.get("difficulty", "easy")
    num = request.data.get("num", 5)

    # print(user_id , category , difficulty)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "Invalid user"}, status=400)
    
    questions = get_gpt_questions(category, difficulty, num)
    room = GameRoom.objects.create(
        room_id=str(uuid.uuid4())[:8],
        questions=questions
    )
    room.users.add(user)
    room.save()

    serializer = GameRoomSerializer(room)

    return Response(serializer.data)

@api_view(["POST"])
def join_room(request):
    room_id = request.data.get("room_id")
    user_id = request.data.get("user_id")

    try:
        room = GameRoom.objects.get(room_id=room_id)
    except GameRoom.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    if room.users.count() > 2:
        return Response({"error": "Room is full"}, status=403)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    
    # Add user to the room
    room.users.add(user)
    
    # Notify via Pusher
    try:
        settings.PUSHER_CLIENT.trigger(f"room-{room_id}", "player-joined", {"user_id": user_id})
    except Exception as e:
        print("Pusher error:", e)
    
    return Response({
        "message": "Joined",
        "room_id": room_id,
        "questions": room.questions  # Already stored as JSON
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def leave_room(request):
    print("leave_room hit!")
    room_id = request.data.get("room_id")
    user_id = request.data.get("user_id")

    try:
        room = GameRoom.objects.get(room_id=room_id)
    except GameRoom.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    room.users.remove(user)

    # Optional: if no one is left, you can delete the room
    if room.users.count() == 0:
        room.delete()

    # Notify the other player via Pusher
    try:
        settings.PUSHER_CLIENT.trigger(
            f"room-{room_id}",
            "player-left",
            {"user_id": user_id}
        )
    except Exception as e:
        print("Pusher error:", e)

    return Response({"message": "Left room"})

@api_view(["POST"])
def player_finished(request):
    room_id = request.data.get("room_id")
    user_id = request.data.get("user_id")
    score = request.data.get("score")
    correct = request.data.get("correct")
    wrong = request.data.get("wrong")
    name = request.data.get("name", "Player")  # Optional

    if not all([room_id, user_id]):
        return Response({"error": "Missing data"}, status=400)

    # ✅ Print or log what you received (for debugging)
    # print("Player finished:", {
    #     "room_id": room_id,
    #     "user_id": user_id,
    #     "score": score,
    #     "correct": correct,
    #     "wrong": wrong,
    #     "name": name,
    # })

    # getting the room
    try:
        room = GameRoom.objects.get(room_id=room_id)
    except GameRoom.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)
    

    # getting all user 
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    
    users = list(room.users.all())
    if user == users[0]:
        room.player1_finished = True
    elif len(users) > 1 and user == users[1]:
        room.player2_finished = True
    room.save()

    #notify frontend
    try:
        settings.PUSHER_CLIENT.trigger(
            f"room-{room_id}",
            "player-finished",
            {
                "user_id": user_id,
                "score": score,
                "correct": correct,
                "wrong": wrong,
                "name": name,
            }
        )
    except Exception as e:
        print("Pusher error:", e)
        return Response({"error": "Pusher failed"}, status=500)
    
    # 🧠 Check again if room still exists before deleting
    if GameRoom.objects.filter(room_id=room_id).exists():
        room = GameRoom.objects.get(room_id=room_id)  # refresh instance

        if room.player1_finished and room.player2_finished:
            room.delete()
            return Response({"message": "Room deleted after both players finished."})
        
    return Response({"message": "Player finished recorded."})


@csrf_exempt
def get_gpt_questions(category, difficulty, num): 
    # body = json.loads(request.body)
    # category = body.get("category", "general knowledge")
    # difficulty = body.get("difficulty", "easy")

    prompt = f"""Give me multiple choice questions in JSON array format.
    Each question should have:
    - body (string)
    - explanation (string)
    - options (list of 4 dicts, with `body` and `is_correct`)

    Category: {category}
    Difficulty: {difficulty}
    Number of Questions: {num}

    Respond only with JSON."""

    # genai.configure(api_key=config("GEMINI_API_KEY"))
    genai.configure(api_key=settings.GOOGLE_API_KEY)

    # client =  OpenAI(
    #         api_key= "AIzaSyCzq_JdNPHaGzzbdPnIQ7So43a88-Oiycw", 
    #         base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    # )

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)

    message = response.text.strip()

    if message.startswith("```json"):
        message = message.replace("```json", "").strip()
    if message.endswith("```"):
        message = message[:-3].strip()


    # print("Raw Gemini response:", message)
    questions = json.loads(message)
    return questions
    # except json.JSONDecodeError as e:
    #     return JsonResponse({"error": f"Failed to parse JSON: {str(e)}", "raw": message}, status=500)

    # return JsonResponse({"questions": questions})
    # return JsonResponse({"error": "POST request required"}, status=400)