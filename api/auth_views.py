from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import UserProfile, SearchHistory
from .serializers import (
    RegisterSerializer, LoginSerializer, UserProfileSerializer,
    SearchHistorySerializer, UserSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            profile = UserProfile.objects.get(user=user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'profile': UserProfileSerializer(profile).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logout successful'})


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)
    
    if request.method == 'GET':
        return Response({
            'user': UserSerializer(request.user).data,
            'profile': UserProfileSerializer(profile).data
        })
    
    elif request.method == 'PATCH':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'user': UserSerializer(request.user).data,
                'profile': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def search_history_view(request):
    if request.method == 'GET':
        history = SearchHistory.objects.filter(user=request.user)[:20]
        serializer = SearchHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SearchHistorySerializer(data=request.data)
        if serializer.is_valid():
            search = serializer.save(user=request.user)
            
            profile = UserProfile.objects.get(user=request.user)
            profile.total_searches += 1
            profile.save()
            
            return Response(SearchHistorySerializer(search).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    profile = UserProfile.objects.get(user=request.user)
    return Response({
        'user': UserSerializer(request.user).data,
        'profile': UserProfileSerializer(profile).data
    })
